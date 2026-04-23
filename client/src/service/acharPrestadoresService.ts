/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 22/04/2026
 * @description Service especializado na orquestração de buscas de prestadores por geolocalização.
 * Realiza a ponte entre os filtros do useBuscaStore e o Controller_Localizacao no backend.
 * Implementa mapeamento de dados para compatibilidade com AWS S3 e estruturas aninhadas do Prisma.
 */

/* STREAMING_CHUNK:Defining Service Interfaces... */

/**
 * Interface para os filtros originados no Zustand Store.
 */
export interface FiltrosBusca {
  idUsuario?: string;
  nome?: string;
  localizacao?: string;
  categoria?: string;
  distancia?: number;
  precoMax?: string;
}

/**
 * Interface do modelo de dados esperado pelo componente UserCard.
 */
export interface PrestadorCardData {
  id: string;
  nome: string;
  tipo: string;
  localidade: string;
  imageUrl: string;
  precoHora?: number;
  avaliacao?: number;
}

/* STREAMING_CHUNK:Implementing Fetch Logic with Flux Logs... */

/**
 * Executa a chamada à API de geolocalização e processa os resultados para o Front-end.
 * @param {FiltrosBusca} filtros - Objeto contendo os critérios de pesquisa.
 * @returns {Promise<PrestadorCardData[]>} - Lista de prestadores formatada para exibição.
 */
export const buscarPrestadores = async (
  filtros: FiltrosBusca,
): Promise<PrestadorCardData[]> => {
  console.log(
    `[LOG-FLUXO] Iniciando buscarPrestadores. Filtros ativos: ${JSON.stringify(filtros)}`,
  );

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';
    const url = new URL(
      `${baseUrl}/nossozelo/geolocalizacao/prestadores`,
    );

    console.log(
      '[LOG-FLUXO] Traduzindo filtros do Front-end para parâmetros de Query da API.',
    );

    // Mapeamento de Parâmetros (Tradução Sênior)
    if (filtros.idUsuario)
      url.searchParams.append(
        'idUsuario',
        filtros.idUsuario,
      );
    if (filtros.nome)
      url.searchParams.append('nome', filtros.nome);
    if (filtros.localizacao)
      url.searchParams.append(
        'localizacao',
        filtros.localizacao,
      );

    // Mapeamento: categoria (Front) -> tipo (Back)
    if (filtros.categoria) {
      console.log(
        `[LOG-FLUXO] Mapeando categoria '${filtros.categoria}' para parâmetro 'tipo'.`,
      );
      url.searchParams.append(
        'tipo',
        filtros.categoria.toLowerCase(),
      );
    }

    // Mapeamento: distancia (Front) -> raioKm (Back)
    if (filtros.distancia) {
      console.log(
        `[LOG-FLUXO] Mapeando raio de ${filtros.distancia}km para parâmetro 'raioKm'.`,
      );
      url.searchParams.append(
        'raioKm',
        filtros.distancia.toString(),
      );
    }

    if (filtros.precoMax)
      url.searchParams.append('precoMax', filtros.precoMax);

    console.log(
      `[LOG-FLUXO] Efetuando requisição GET para o endpoint de geolocalização: ${url.pathname}`,
    );

    const resposta = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!resposta.ok) {
      console.error(
        `[ERRO-FLUXO] Resposta da API inválida. Status: ${resposta.status}`,
      );
      let erroData;
      try {
        erroData = await resposta.json();
      } catch {
        throw new Error(
          `Erro no servidor (Status: ${resposta.status}).`,
        );
      }
      throw new Error(
        erroData.erro ||
          erroData.message ||
          'Erro ao buscar prestadores.',
      );
    }

    const dados = await resposta.json();
    console.log(
      `[LOG-FLUXO] Dados recebidos da API. Iniciando mapeamento de ${dados.length} registros.`,
    );

    /* STREAMING_CHUNK:Mapping Data to UI Format (Prisma + AWS S3 Support)... */

    return dados.map((prestador: any) => {
      // Resolução de imagem: Prioridade para AWS S3 (providerProfile) com fallback para logo padrão
      const imagemFinal =
        prestador.providerProfile?.avatarUrlAws ||
        prestador.avatarUrlAws ||
        prestador.url_foto_perfil ||
        '/logos/OnlyLogo.png';

      // Resolução de Nome: Tratando estruturas aninhadas do Prisma
      const nomeFinal =
        prestador.providerProfile?.name ||
        prestador.nome ||
        prestador.name ||
        'Prestador sem nome';

      return {
        id: prestador.id,
        nome: nomeFinal,
        tipo: prestador.tipo
          ? prestador.tipo.charAt(0).toUpperCase() +
            prestador.tipo.slice(1)
          : 'Serviço',
        localidade:
          prestador.cidade && prestador.estado
            ? `${prestador.cidade}, ${prestador.estado}`
            : 'Indaiatuba, SP',
        imageUrl: imagemFinal,
        precoHora:
          prestador.valorHora || prestador.preco || 0,
        avaliacao:
          prestador.avaliacao_media ||
          prestador.avaliacao ||
          0,
      };
    });
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Falha crítica no serviço de busca de prestadores: ${error.message}`,
    );
    throw error;
  }
};
