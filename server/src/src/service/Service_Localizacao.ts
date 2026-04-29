/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável por operações de geoprocessamento, geocodificação via APIs externas
 * (Nominatim e ViaCEP) e cálculos de proximidade geográfica utilizando fórmulas de trigonometria esférica.
 * @rota server\src\service\Service_Localizacao.ts
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

const ESTADOS_BRASIL: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

function normalizarTextoBusca(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function obterUfPorTexto(localizacao: string) {
  const texto = normalizarTextoBusca(localizacao);
  const uf = texto.toUpperCase();

  if (Object.values(ESTADOS_BRASIL).includes(uf)) {
    return uf;
  }

  return ESTADOS_BRASIL[texto] || null;
}

export class GeolocalizacaoService {
  private static readonly userAgent =
    process.env.NOMINATIM_USER_AGENT ||
    'NossoZelo/1.0 (contato@nossozelo.com.br)';
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Gera o fragmento SQL para cálculo de distância usando a Fórmula de Haversine.
   * @param {number} lat - Latitude de origem.
   * @param {number} lon - Longitude de origem.
   * @returns {any} - Fragmento SQL compatível com Prisma.sql.
   */
  private static getSqlDistancia(lat: number, lon: number) {    return Prisma.sql`
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
   * Recupera as coordenadas geográficas de um usuário na base de dados.
   * @param {string} usuarioId - UUID/ID do usuário.
   * @returns {Promise<Coordenadas>} - Latitude e longitude do usuário.
   * @throws {Error} - Lança erro caso o registro de localização seja inexistente.
   */
  private static async obterLocalizacaoUsuario(
    usuarioId: string,
  ): Promise<Coordenadas> {    try {      const loc = await prisma.localizacoes.findUnique({
        where: { usuario_id: usuarioId },
      });

      if (!loc) {        throw new Error(
          'Localização do usuário não encontrada.',
        );
      }      return {
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      };
    } catch (error: any) {      throw error;
    }
  }

  // --- MÉTODOS DE GEOCODIFICAÇÃO ---

  /**
   * Converte um CEP em coordenadas geográficas utilizando um fluxo resiliente de múltiplas tentativas.
   * @param {string} cep - CEP brasileiro (com ou sem formatação).
   * @returns {Promise<Coordenadas>} - Objeto contendo latitude e longitude.
   * @throws {Error} - Lança erro se todas as estratégias de busca falharem.
   */
  public static async buscarCoordenadasPorCep(
    cep: string,
  ): Promise<Coordenadas> {
    const cepLimpo = cep.replace(/\D/g, '');    try {      const coordenadasDiretas =
        await this.buscarPorCepNoNominatim(cepLimpo);

      if (coordenadasDiretas) {        return coordenadasDiretas;
      }      const endereco = await this.buscarEnderecoViaCep(
        cepLimpo,
      );  const coordenadasEndereco =
        await this.buscarPorEndereco(endereco);

      if (coordenadasEndereco) {        return coordenadasEndereco;
      }      const cidadeEstado = `${endereco.localidade}, ${endereco.uf}, Brasil`;
      const coordenadasCidade =
        await this.buscarPorEndereco(cidadeEstado);

      if (coordenadasCidade) {        return coordenadasCidade;
      }      throw new Error('Coordenadas não encontradas.');
    } catch (erro: any) {      throw new Error(
        `Erro ao buscar coordenadas: ${erro}`,
      );
    }
  }

  /**
   * Realiza busca de CEP diretamente na API do Nominatim.
   * @param {string} cep - CEP numérico.
   */
  private static async buscarPorCepNoNominatim(
    cep: string,
  ): Promise<Coordenadas | null> {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`;    try {
      const resposta = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      const dados = await resposta.json();

      if (dados && dados.length > 0) {        return {
          latitude: parseFloat(dados[0].lat),
          longitude: parseFloat(dados[0].lon),
        };
      }      return null;
    } catch (error: any) {      return null;
    }
  }

  /**
   * Consulta os dados de endereço em texto via ViaCEP.
   * @param {string} cep - CEP numérico.
   */
  private static async buscarEnderecoViaCep(
    cep: string,
  ): Promise<any> {
    const url = `https://viacep.com.br/ws/${cep}/json/`;    try {
      const resposta = await fetch(url);
      const dados = await resposta.json();

      if (dados.erro) {        throw new Error('CEP não encontrado.');
      }      return dados;
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Geocodifica uma string de endereço ou objeto de endereço.
   * @param {string | any} endereco - Texto ou objeto de endereço.
   */
  private static async buscarPorEndereco(
    endereco: string | any,
  ): Promise<Coordenadas | null> {
    const query =
      typeof endereco === 'string'
        ? endereco
        : `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json`;    try {
      const resposta = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
      });
      const dados = await resposta.json();

      if (dados && dados.length > 0) {        return {
          latitude: parseFloat(dados[0].lat),
          longitude: parseFloat(dados[0].lon),
        };
      }      return null;
    } catch (error: any) {      return null;
    }
  }

  public static async buscarCoordenadasPorTexto(
    localizacao: string,
  ): Promise<Coordenadas | null> {
    const texto = localizacao.trim();
    if (!texto) return null;

    const query = texto.toLowerCase().includes('brasil')
      ? texto
      : `${texto}, Brasil`;

    return this.buscarPorEndereco(query);
  }

  // --- MÉTODOS DE BUSCA NO BANCO ---

  /**
   * Realiza busca dinâmica de prestadores com múltiplos filtros e cálculo de raio opcional.
   * @param {object} params - Parâmetros de filtro (idUsuario, nome, localizacao, tipo, raioKm, precoMax, limit).
   * @returns {Promise<any[]>} - Lista de prestadores encontrados.
   */
  public static async buscarPrestadores(params: {
    idUsuario?: string;
    nome?: string;
    localizacao?: string;
    latitude?: number;
    longitude?: number;
    tipo?: string;
    raioKm?: number;
    precoMax?: number;
    limit?: number;
  }): Promise<any[]> {    const {
      idUsuario,
      nome,
      localizacao,
      latitude,
      longitude,
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
      conditions.push(Prisma.sql`u.email_confirmado = true`);
      conditions.push(Prisma.sql`u.status_cadastro = 'ativo'`);
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1
        FROM assinaturas ass
        WHERE ass.prestador_id = u.id
          AND ass.status = 'ativa'
      )`);

      // Filtro de Tipo
      if (tipoFiltro) {        conditions.push(Prisma.sql`u.tipo = ${tipoFiltro}`);
      } else {        conditions.push(
          Prisma.sql`u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')`,
        );
      }

      // Filtro de Nome
      if (nome) {        conditions.push(
          Prisma.sql`u.nome LIKE ${'%' + nome + '%'}`,
        );
      }

      // Filtro de Preço
      if (precoMax) {        conditions.push(
          Prisma.sql`EXISTS (SELECT 1 FROM servicos s WHERE s.prestador_id = u.id AND s.valor <= ${Number(
            precoMax,
          )})`,
        );
      }

      let selectDistancia = Prisma.empty;
      let havingClause = Prisma.empty;
      let orderClause = Prisma.sql`ORDER BY u.criado_em DESC`;
      let origemBusca: Coordenadas | null = null;

      if (
        typeof latitude === 'number' &&
        typeof longitude === 'number' &&
        !Number.isNaN(latitude) &&
        !Number.isNaN(longitude)
      ) {
        origemBusca = { latitude, longitude };
      }

      if (localizacao) {
        const ufInformada = obterUfPorTexto(localizacao);

        if (ufInformada) {          conditions.push(Prisma.sql`u.estado = ${ufInformada}`);
        } else {
          const coordenadasLocalizacao =
            await this.buscarCoordenadasPorTexto(localizacao);

          if (coordenadasLocalizacao) {
            origemBusca = coordenadasLocalizacao;
          } else {
            conditions.push(
              Prisma.sql`(u.cidade LIKE ${
                '%' + localizacao + '%'
              } OR u.estado LIKE ${'%' + localizacao + '%'})`,
            );
          }
        }
      }

      // Lógica de Cálculo de Raio Dinâmico
      if (!origemBusca && idUsuario && raioKm) {        try {
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
          orderClause = Prisma.sql`ORDER BY distancia ASC`;        } catch (error) {        }
      }

      if (origemBusca) {
        const raioEfetivo = Number(
          raioKm || (localizacao ? 100 : undefined),
        );

        selectDistancia = Prisma.sql`, ${this.getSqlDistancia(
          origemBusca.latitude,
          origemBusca.longitude,
        )} AS distancia`;

        if (raioEfetivo && !Number.isNaN(raioEfetivo)) {
          havingClause = Prisma.sql`HAVING distancia <= ${raioEfetivo}`;
        }

        orderClause = Prisma.sql`ORDER BY distancia ASC`;
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
          u.id,
          u.nome,
          u.tipo,
          u.url_foto_perfil,
          u.cidade,
          u.estado,
          u.bairro,
          u.avaliacao_media,
          u.email_confirmado,
          MIN(s.valor) AS preco,
          COUNT(DISTINCT s.id) AS total_servicos,
          COALESCE(c.disponibilidade, e.disponibilidade, a.disponibilidade) AS disponibilidade,
          COALESCE(c.especialidades, e.especialidades, a.especialidades) AS especialidades
          ${selectDistancia}
        FROM usuarios u
        LEFT JOIN localizacoes l ON u.id = l.usuario_id
        LEFT JOIN servicos s ON s.prestador_id = u.id
        LEFT JOIN cuidadores c ON c.usuario_id = u.id
        LEFT JOIN enfermeiros e ON e.usuario_id = u.id
        LEFT JOIN acompanhantes a ON a.usuario_id = u.id
        ${whereClause}
        GROUP BY
          u.id,
          u.nome,
          u.tipo,
          u.url_foto_perfil,
          u.cidade,
          u.estado,
          u.bairro,
          u.avaliacao_media,
          u.email_confirmado,
          l.latitude,
          l.longitude,
          c.disponibilidade,
          e.disponibilidade,
          a.disponibilidade,
          c.especialidades,
          e.especialidades,
          a.especialidades
        ${havingClause}
        ${orderClause}
        LIMIT ${Number(limit)};
      `;      const resultados = await prisma.$queryRaw(query);      return resultados as any[];
    } catch (error: any) {      throw error;
    }
  }

  // --- MÉTODOS ADICIONAIS LEGADOS ---

  /**
   * Busca IDs de usuários dentro de um raio específico baseado em um usuário de referência.
   * @param {string} usuarioId - ID do usuário de origem.
   * @param {number} raioKm - Raio em quilômetros.
   */
  public static async buscarUsuariosPorRaioPorUsuarioId(
    usuarioId: string,
    raioKm: number,
  ): Promise<string[]> {    try {
      const loc = await this.obterLocalizacaoUsuario(
        usuarioId,
      );      const usuarios = await prisma.$queryRaw<any[]>`
        SELECT u.id
        FROM usuarios u
        JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        AND u.email_confirmado = true
        AND u.status_cadastro = 'ativo'
        AND EXISTS (
          SELECT 1
          FROM assinaturas ass
          WHERE ass.prestador_id = u.id
            AND ass.status = 'ativa'
        )
        AND ${this.getSqlDistancia(
          loc.latitude,
          loc.longitude,
        )} <= ${raioKm};
      `;      return usuarios.map((u: any) => u.id);
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Retorna os 20 usuários mais próximos geograficamente de um usuário.
   * @param {string} usuarioId - ID do usuário de referência.
   */
  public static async buscar20UsuariosMaisProximos(
    usuarioId: string,
  ): Promise<string[]> {    try {
      const loc = await this.obterLocalizacaoUsuario(
        usuarioId,
      );      const usuariosProximos = await prisma.$queryRaw<
        any[]
      >`
        SELECT u.id, ${this.getSqlDistancia(
          loc.latitude,
          loc.longitude,
        )} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.id != ${usuarioId} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        AND u.email_confirmado = true
        AND u.status_cadastro = 'ativo'
        AND EXISTS (
          SELECT 1
          FROM assinaturas ass
          WHERE ass.prestador_id = u.id
            AND ass.status = 'ativa'
        )
        ORDER BY distancia ASC
        LIMIT 20;
      `;      return usuariosProximos.map((u: any) => u.id);
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Retorna os 20 usuários mais próximos filtrados por tipo profissional.
   * @param {string} usuarioId - ID do usuário de referência.
   * @param {string} tipo - Tipo de prestador.
   */
  public static async buscar20UsuariosMaisProximosPorTipo(
    usuarioId: string,
    tipo: string,
  ): Promise<string[]> {    try {
      const tiposPermitidos = [
        'cuidador',
        'enfermeiro',
        'acompanhante',
      ];
      if (!tiposPermitidos.includes(tipo)) {        throw new Error('Tipo inválido.');
      }

      const loc = await this.obterLocalizacaoUsuario(
        usuarioId,
      );      const usuariosProximos = await prisma.$queryRaw<
        any[]
      >`
        SELECT u.id, ${this.getSqlDistancia(
          loc.latitude,
          loc.longitude,
        )} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.id != ${usuarioId} AND u.tipo = ${tipo}
        AND u.email_confirmado = true
        AND u.status_cadastro = 'ativo'
        AND EXISTS (
          SELECT 1
          FROM assinaturas ass
          WHERE ass.prestador_id = u.id
            AND ass.status = 'ativa'
        )
        ORDER BY distancia ASC
        LIMIT 20;
      `;      return usuariosProximos.map((u: any) => u.id);
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Busca prestadores por nome dentro de um limite geográfico.
   * @param {string} usuarioId - ID do usuário de referência.
   * @param {string} nome - Nome ou parte do nome para busca.
   * @param {number} [raioKm=50] - Raio de corte em KM.
   */
  public static async buscarPorNomeERaio(
    usuarioId: string,
    nome: string,
    raioKm: number = 50,
  ): Promise<any[]> {    try {
      const loc = await this.obterLocalizacaoUsuario(
        usuarioId,
      );
      const nomeBusca = `%${nome}%`;      const resultados = await prisma.$queryRaw<any[]>`
        SELECT u.id, u.nome, u.tipo, ${this.getSqlDistancia(
          loc.latitude,
          loc.longitude,
        )} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.nome LIKE ${nomeBusca} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        AND u.email_confirmado = true
        AND u.status_cadastro = 'ativo'
        AND EXISTS (
          SELECT 1
          FROM assinaturas ass
          WHERE ass.prestador_id = u.id
            AND ass.status = 'ativa'
        )
        HAVING distancia <= ${raioKm}
        ORDER BY distancia ASC
        LIMIT 20;
      `;      return resultados;
    } catch (error: any) {      throw error;
    }
  }
}

export default GeolocalizacaoService;
