import api, { extrairErroApi } from '@/service/api';
import { AvaliacaoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'avaliacaoService';

export interface RegistrarAvaliacaoPayload {
  contratacao_id: number;
  prestador_id?: string;
  tipo_prestador?: string;
  nota: number;
  comentario?: string;
}

export interface DisponibilidadeAvaliacao {
  contratacao_id: number;
  pode_avaliar: boolean;
  tipo_avaliacao:
    | 'cliente_para_prestador'
    | 'prestador_para_cliente'
    | null;
  avaliacao_existente: boolean;
  avaliacao_disponivel_em: string | null;
  motivo_bloqueio: string | null;
  mensagem_usuario: string;
}

export interface RegistrarAvaliacaoResposta {
  avaliacao: AvaliacaoPerfil;
  disponibilidade: DisponibilidadeAvaliacao;
}

function logarErro(endpoint: string, error: unknown) {
  const { status, mensagem } = extrairErroApi(error);

  logger.error(CONTEXTO, `Erro na requisição ${endpoint}`, {
    status,
    mensagem,
    mensagemAmigavel: extrairMensagemErro(error),
  });
}

export const avaliacaoService = {
  listarPorPrestador: async (
    prestadorId: string,
  ): Promise<AvaliacaoPerfil[]> => {
    const endpoint = `/avaliacoes/prestador/${prestadorId}`;

    try {
      logger.info(CONTEXTO, 'Listando avaliações do prestador', {
        prestadorId,
      });

      const response =
        await api.get<AvaliacaoPerfil[]>(endpoint);

      logger.info(
        CONTEXTO,
        'Avaliações carregadas com sucesso',
        {
          prestadorId,
          total: response.data.length,
        },
      );

      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  registrarAvaliacao: async (
    payload: RegistrarAvaliacaoPayload,
  ): Promise<RegistrarAvaliacaoResposta> => {
    const endpoint = '/avaliacoes';

    try {
      logger.info(CONTEXTO, 'Registrando avaliação', {
        contratacao_id: payload.contratacao_id,
        prestador_id: payload.prestador_id,
      });

      const response = await api.post<RegistrarAvaliacaoResposta>(
        endpoint,
        payload,
      );

      logger.info(
        CONTEXTO,
        'Avaliação registrada com sucesso',
        {
          avaliacaoId: response.data.avaliacao?.id,
          contratacao_id: payload.contratacao_id,
        },
      );

      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  consultarDisponibilidade: async (
    contratacaoId: number,
  ): Promise<DisponibilidadeAvaliacao> => {
    const endpoint = `/avaliacoes/disponibilidade/${contratacaoId}`;
    const response = await api.get<DisponibilidadeAvaliacao>(endpoint);
    return response.data;
  },

  listarMinhasPendentes: async (): Promise<{
    pendentes: Array<{
      contratacao_id: number;
      nome_avaliado: string;
      tipo_avaliacao: string;
      data_servico: string;
      pode_avaliar: boolean;
      avaliacao_disponivel_em: string | null;
    }>;
  }> => {
    const response = await api.get('/avaliacoes/minhas-pendentes');
    return response.data;
  },
};

export default avaliacaoService;
