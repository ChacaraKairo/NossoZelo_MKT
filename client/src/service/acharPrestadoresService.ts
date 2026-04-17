// client/src/service/acharPrestadoresService.ts

// 1. Tipagem exata dos parâmetros que vêm do Zustand
export interface FiltrosBusca {
  idUsuario?: string;
  nome?: string;
  localizacao?: string;
  categoria?: string;
  distancia?: number;
  precoMax?: string;
}

// 2. Tipagem do objeto que o componente UserCard espera receber
export interface PrestadorCardData {
  id: string;
  nome: string;
  tipo: string;
  localidade: string;
  imageUrl: string;
  precoHora?: number;
  avaliacao?: number;
}

export const buscarPrestadores = async (
  filtros: FiltrosBusca,
): Promise<PrestadorCardData[]> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';

    // 🔥 Apontamos para a SUA rota oficial de geolocalização
    const url = new URL(
      `${baseUrl}/nossozelo/geolocalizacao/prestadores`,
    );

    // 🔥 Tradução Sênior: Mapeamos o estado do Zustand para o que o seu Controller_Localizacao.ts espera ler
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

    // O seu controller espera "tipo", mas o front usa "categoria"
    if (filtros.categoria)
      url.searchParams.append(
        'tipo',
        filtros.categoria.toLowerCase(),
      );

    // O seu controller espera "raioKm", mas o front usa "distancia"
    if (filtros.distancia)
      url.searchParams.append(
        'raioKm',
        filtros.distancia.toString(),
      );

    if (filtros.precoMax)
      url.searchParams.append('precoMax', filtros.precoMax);

    const resposta = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!resposta.ok) {
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

    // 3. Mapeamento para o Card (Ajustado para Prisma + AWS S3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dados.map((prestador: any) => {
      // Tenta achar a imagem na propriedade nova (AWS), ou na antiga, ou usa o logo como fallback
      const imagemAchar =
        prestador.providerProfile?.avatarUrlAws ||
        prestador.avatarUrlAws ||
        prestador.url_foto_perfil ||
        '/logos/OnlyLogo.png';

      // Tenta achar o nome na estrutura aninhada do Prisma ou na raiz
      const nomeAchar =
        prestador.providerProfile?.name ||
        prestador.nome ||
        prestador.name ||
        'Prestador sem nome';

      return {
        id: prestador.id,
        nome: nomeAchar,
        tipo: prestador.tipo
          ? prestador.tipo.charAt(0).toUpperCase() +
            prestador.tipo.slice(1)
          : 'Serviço',
        localidade:
          prestador.cidade && prestador.estado
            ? `${prestador.cidade}, ${prestador.estado}`
            : 'Indaiatuba, SP',
        imageUrl: imagemAchar,
        precoHora:
          prestador.valorHora || prestador.preco || 0,
        avaliacao:
          prestador.avaliacao_media ||
          prestador.avaliacao ||
          0,
      };
    });
  } catch (error) {
    console.error(
      'Erro no serviço de busca de prestadores:',
      error,
    );
    throw error;
  }
};
