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
   * ✅ MÉTODO CENTRALIZADO DE CÁLCULO (SQL)
   * Retorna o fragmento de SQL da fórmula de Haversine para ser injetado nas queries.
   */
  private static getSqlDistancia(
    lat: number,
    lon: number,
  ): Prisma.Sql {
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

  /**
   * ✅ MÉTODO AUXILIAR PARA BUSCAR LOCALIZAÇÃO DO USUÁRIO
   */
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

  // --- MÉTODOS DE GEOCODIFICAÇÃO (NOMINATIM / VIACEP) ---

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

  // --- MÉTODOS DE BUSCA NO BANCO (REFATORADOS COM SQL HELPER) ---

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

    return usuarios.map((u) => u.id);
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

    return usuariosProximos.map((u) => u.id);
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

    return usuariosProximos.map((u) => u.id);
  }

  public static async buscarPrestadores(params: {
    nome?: string;
    localizacao?: string;
    tipo?: string;
    limit?: number;
  }): Promise<any[]> {
    const { nome, localizacao, tipo, limit = 20 } = params;
    const tiposPermitidos = [
      'cuidador',
      'enfermeiro',
      'acompanhante',
    ];
    const tipoFiltro =
      tipo && tiposPermitidos.includes(tipo)
        ? tipo
        : { in: tiposPermitidos };

    return await prisma.usuarios.findMany({
      where: {
        tipo: tipoFiltro as any,
        nome: nome ? { contains: nome } : undefined,
        ...(localizacao
          ? {
              OR: [
                { cidade: { contains: localizacao } },
                { estado: { contains: localizacao } },
              ],
            }
          : {}),
      },
      include: { localizacoes: true },
      take: limit,
    });
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
