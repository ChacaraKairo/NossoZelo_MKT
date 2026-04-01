import { PrismaClient, Prisma } from '@prisma/client';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

const prisma = new PrismaClient();

export class GeolocalizacaoService {
  private static readonly userAgent =
    'SeuApp/1.0 (seuemail@exemplo.com)';
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * ✅ MÉTODO CENTRALIZADO DE CÁLCULO (SQL OFICIAL DO PRISMA)
   */
  private static getSqlDistancia(lat: number, lon: number) {
    return Prisma.sql`
      (${this.EARTH_RADIUS_KM} * ACOS(
        COS(RADIANS(${lat})) *
        COS(RADIANS(l.latitude)) *
        COS(RADIANS(l.longitude) - RADIANS(${lon})) +
        SIN(RADIANS(${lat})) *
        SIN(RADIANS(l.latitude))
      ))
    `;
  }

  private static async obterLocalizacaoUsuario(
    usuarioId: string,
  ): Promise<Coordenadas> {
    const loc = await prisma.localizacoes.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!loc)
      throw new Error(
        'Localização do usuário não encontrada.',
      );

    return {
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
    };
  }

  // --- MÉTODOS DE GEOCODIFICAÇÃO ---

  public static async buscarCoordenadasPorCep(
    cep: string,
  ): Promise<Coordenadas> {
    const cepLimpo = cep.replace(/\D/g, '');
    try {
      const coordenadasDiretas =
        await this.buscarPorCepNoNominatim(cepLimpo);
      if (coordenadasDiretas) return coordenadasDiretas;

      const endereco = await this.buscarEnderecoViaCep(
        cepLimpo,
      );
      const coordenadasEndereco =
        await this.buscarPorEndereco(endereco);
      if (coordenadasEndereco) return coordenadasEndereco;

      const cidadeEstado = `${endereco.localidade}, ${endereco.uf}, Brasil`;
      const coordenadasCidade =
        await this.buscarPorEndereco(cidadeEstado);
      if (coordenadasCidade) return coordenadasCidade;

      throw new Error('Coordenadas não encontradas.');
    } catch (erro) {
      throw new Error(
        `Erro ao buscar coordenadas: ${erro}`,
      );
    }
  }

  private static async buscarPorCepNoNominatim(
    cep: string,
  ): Promise<Coordenadas | null> {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`;
    const resposta = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });
    const dados = await resposta.json();
    if (dados.length > 0) {
      return {
        latitude: parseFloat(dados[0].lat),
        longitude: parseFloat(dados[0].lon),
      };
    }
    return null;
  }

  private static async buscarEnderecoViaCep(
    cep: string,
  ): Promise<any> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const resposta = await fetch(url);
    const dados = await resposta.json();
    if (dados.erro) throw new Error('CEP não encontrado.');
    return dados;
  }

  private static async buscarPorEndereco(
    endereco: string | any,
  ): Promise<Coordenadas | null> {
    const query =
      typeof endereco === 'string'
        ? endereco
        : `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json`;
    const resposta = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });
    const dados = await resposta.json();
    if (dados.length > 0) {
      return {
        latitude: parseFloat(dados[0].lat),
        longitude: parseFloat(dados[0].lon),
      };
    }
    return null;
  }

  // --- MÉTODOS DE BUSCA NO BANCO ---

  /**
   * ✅ BUSCA MASTER DINÂMICA DE PRESTADORES
   */
  public static async buscarPrestadores(params: {
    idUsuario?: string;
    nome?: string;
    localizacao?: string;
    tipo?: string;
    raioKm?: number;
    precoMax?: number;
    limit?: number;
  }): Promise<any[]> {
    const {
      idUsuario,
      nome,
      localizacao,
      tipo,
      raioKm,
      precoMax,
      limit = 20,
    } = params;

    try {
      const tiposPermitidos = [
        'cuidador',
        'enfermeiro',
        'acompanhante',
      ];
      const tipoFiltro =
        tipo && tiposPermitidos.includes(tipo)
          ? tipo
          : null;

      const conditions = [];

      if (tipoFiltro) {
        conditions.push(Prisma.sql`u.tipo = ${tipoFiltro}`);
      } else {
        conditions.push(
          Prisma.sql`u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')`,
        );
      }

      if (nome) {
        conditions.push(
          Prisma.sql`u.nome LIKE ${'%' + nome + '%'}`,
        );
      }

      if (localizacao) {
        conditions.push(
          Prisma.sql`(u.cidade LIKE ${
            '%' + localizacao + '%'
          } OR u.estado LIKE ${'%' + localizacao + '%'})`,
        );
      }

      if (precoMax) {
        conditions.push(
          Prisma.sql`EXISTS (SELECT 1 FROM servicos s WHERE s.prestador_id = u.id AND s.valor <= ${Number(
            precoMax,
          )})`,
        );
      }

      let selectDistancia = Prisma.empty;
      let havingClause = Prisma.empty;
      let orderClause = Prisma.sql`ORDER BY u.criado_em DESC`;

      if (idUsuario && raioKm) {
        try {
          const loc = await this.obterLocalizacaoUsuario(
            idUsuario,
          );
          selectDistancia = Prisma.sql`, ${this.getSqlDistancia(
            loc.latitude,
            loc.longitude,
          )} AS distancia`;
          havingClause = Prisma.sql`HAVING distancia <= ${Number(
            raioKm,
          )}`;
          orderClause = Prisma.sql`ORDER BY distancia ASC`;
        } catch (error) {
          console.warn(
            'Usuário não possui localização cadastrada. Ignorando filtro de raioKm.',
          );
        }
      }

      const whereClause =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(
              conditions,
              ' AND ',
            )}`
          : Prisma.empty;

      const query = Prisma.sql`
        SELECT 
          u.id, u.nome, u.tipo, u.url_foto_perfil, u.cidade, u.estado
          ${selectDistancia}
        FROM usuarios u
        LEFT JOIN localizacoes l ON u.id = l.usuario_id
        ${whereClause}
        ${havingClause}
        ${orderClause}
        LIMIT ${Number(limit)};
      `;

      return await prisma.$queryRaw(query);
    } catch (error: any) {
      console.error(
        '🔥 ERRO FATAL NA QUERY DO PRISMA:',
        error,
      );
      throw error;
    }
  }

  // --- MÉTODOS ADICIONAIS LEGADOS ---

  public static async buscarUsuariosPorRaioPorUsuarioId(
    usuarioId: string,
    raioKm: number,
  ): Promise<string[]> {
    const loc = await this.obterLocalizacaoUsuario(
      usuarioId,
    );
    const usuarios = await prisma.$queryRaw<any[]>`
      SELECT u.id
      FROM usuarios u
      JOIN localizacoes l ON u.id = l.usuario_id
      WHERE u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
      AND ${this.getSqlDistancia(
        loc.latitude,
        loc.longitude,
      )} <= ${raioKm};
    `;
    return usuarios.map((u: any) => u.id);
  }

  public static async buscar20UsuariosMaisProximos(
    usuarioId: string,
  ): Promise<string[]> {
    const loc = await this.obterLocalizacaoUsuario(
      usuarioId,
    );
    const usuariosProximos = await prisma.$queryRaw<any[]>`
      SELECT u.id, ${this.getSqlDistancia(
        loc.latitude,
        loc.longitude,
      )} AS distancia
      FROM usuarios u
      INNER JOIN localizacoes l ON u.id = l.usuario_id
      WHERE u.id != ${usuarioId} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
      ORDER BY distancia ASC
      LIMIT 20;
    `;
    return usuariosProximos.map((u: any) => u.id);
  }

  public static async buscar20UsuariosMaisProximosPorTipo(
    usuarioId: string,
    tipo: string,
  ): Promise<string[]> {
    const tiposPermitidos = [
      'cuidador',
      'enfermeiro',
      'acompanhante',
    ];
    if (!tiposPermitidos.includes(tipo))
      throw new Error('Tipo inválido.');
    const loc = await this.obterLocalizacaoUsuario(
      usuarioId,
    );
    const usuariosProximos = await prisma.$queryRaw<any[]>`
      SELECT u.id, ${this.getSqlDistancia(
        loc.latitude,
        loc.longitude,
      )} AS distancia
      FROM usuarios u
      INNER JOIN localizacoes l ON u.id = l.usuario_id
      WHERE u.id != ${usuarioId} AND u.tipo = ${tipo}
      ORDER BY distancia ASC
      LIMIT 20;
    `;
    return usuariosProximos.map((u: any) => u.id);
  }

  public static async buscarPorNomeERaio(
    usuarioId: string,
    nome: string,
    raioKm: number = 50,
  ): Promise<any[]> {
    const loc = await this.obterLocalizacaoUsuario(
      usuarioId,
    );
    const nomeBusca = `%${nome}%`;
    return await prisma.$queryRaw`
      SELECT u.id, u.nome, u.tipo, ${this.getSqlDistancia(
        loc.latitude,
        loc.longitude,
      )} AS distancia
      FROM usuarios u
      INNER JOIN localizacoes l ON u.id = l.usuario_id
      WHERE u.nome LIKE ${nomeBusca} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
      HAVING distancia <= ${raioKm}
      ORDER BY distancia ASC
      LIMIT 20;
    `;
  }
}
