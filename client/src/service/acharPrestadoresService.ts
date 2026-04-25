import api from '@/service/api';
import { PrestadorCardData } from '@/types/prestador';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'acharPrestadoresService';

export interface FiltrosBusca {
  idUsuario?: string;
  nome?: string;
  localizacao?: string;
  categoria?: string;
  distancia?: number;
  precoMax?: string;
}

export type { PrestadorCardData } from '@/types/prestador';

function normalizarNumero(valor: unknown): number | undefined {
  if (valor === null || valor === undefined || valor === '') return undefined;
  const numero = Number(valor);
  return Number.isNaN(numero) ? undefined : numero;
}

function formatarTipo(tipo?: string | null) {
  if (!tipo) return 'Serviço';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
}

function montarLocalidade(prestador: any): string {
  const cidade = prestador.cidade || prestador.providerProfile?.cidade;
  const estado = prestador.estado || prestador.providerProfile?.estado;

  if (cidade && estado) return `${cidade}, ${estado}`;
  if (cidade) {
    logger.debug(CONTEXTO, 'Localização incompleta: apenas cidade', {
      prestadorId: prestador.id,
      cidade,
    });
    return cidade;
  }
  if (estado) {
    logger.debug(CONTEXTO, 'Localização incompleta: apenas estado', {
      prestadorId: prestador.id,
      estado,
    });
    return estado;
  }

  logger.debug(CONTEXTO, 'Localização não informada pela API', {
    prestadorId: prestador.id,
  });
  return 'Localização não informada';
}

function mapearPrestador(prestador: any): PrestadorCardData {
  const cidade = prestador.cidade || prestador.providerProfile?.cidade;
  const estado = prestador.estado || prestador.providerProfile?.estado;

  return {
    id: String(prestador.id),
    nome:
      prestador.providerProfile?.name ||
      prestador.nome ||
      prestador.name ||
      'Prestador sem nome',
    tipo: formatarTipo(prestador.tipo),
    cidade,
    estado,
    bairro: prestador.bairro || prestador.providerProfile?.bairro,
    localidade: montarLocalidade(prestador),
    imageUrl:
      prestador.providerProfile?.avatarUrlAws ||
      prestador.avatarUrlAws ||
      prestador.url_foto_perfil ||
      '/logos/OnlyLogo.png',
    precoHora: normalizarNumero(
      prestador.valorHora ??
        prestador.valor_hora ??
        prestador.precoHora ??
        prestador.preco,
    ),
    avaliacao: normalizarNumero(
      prestador.avaliacao_media ?? prestador.avaliacao,
    ),
    disponibilidade: prestador.disponibilidade,
    especialidades: prestador.especialidades,
    verificado:
      prestador.verificado ??
      prestador.email_confirmado ??
      prestador.providerProfile?.verificado,
  };
}

export const buscarPrestadores = async (
  filtros: FiltrosBusca,
): Promise<PrestadorCardData[]> => {
  logger.info(CONTEXTO, 'Iniciando busca de prestadores', filtros);

  try {
    const params: Record<string, string> = {};

    if (filtros.idUsuario) params.idUsuario = filtros.idUsuario;
    if (filtros.nome) params.nome = filtros.nome;
    if (filtros.localizacao) params.localizacao = filtros.localizacao;
    if (filtros.categoria) params.tipo = filtros.categoria.toLowerCase();
    if (filtros.distancia) params.raioKm = String(filtros.distancia);
    if (filtros.precoMax) params.precoMax = filtros.precoMax;

    logger.debug(CONTEXTO, 'Parâmetros enviados para API', params);

    const response = await api.get('/geolocalizacao/prestadores', {
      params,
    });
    const dados = Array.isArray(response.data) ? response.data : [];
    const prestadores = dados.map(mapearPrestador);

    logger.info(CONTEXTO, 'Prestadores recebidos da API', {
      total: prestadores.length,
    });

    return prestadores;
  } catch (error: unknown) {
    const mensagem = extrairMensagemErro(error);
    logger.error(CONTEXTO, 'Falha ao buscar prestadores', {
      mensagem,
      filtros,
    });
    throw new Error(mensagem);
  }
};
