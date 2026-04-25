import api, { extrairErroApi } from '@/service/api';
import { AvaliacaoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'avaliacaoService';

export interface RegistrarAvaliacaoPayload {
  contratacao_id: number;
  prestador_id: string;
  tipo_prestador?: string;
  nota: number;
  comentario?: string;
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
  ): Promise<AvaliacaoPerfil> => {
    const endpoint = '/avaliacoes';

    try {
      logger.info(CONTEXTO, 'Registrando avaliação', {
        contratacao_id: payload.contratacao_id,
        prestador_id: payload.prestador_id,
      });

      const response = await api.post<AvaliacaoPerfil>(
        endpoint,
        payload,
      );

      logger.info(
        CONTEXTO,
        'Avaliação registrada com sucesso',
        {
          avaliacaoId: response.data.id,
          contratacao_id: payload.contratacao_id,
        },
      );

      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },
};

export default avaliacaoService;
