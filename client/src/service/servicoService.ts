import api, { extrairErroApi } from '@/service/api';
import { ServicoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'servicoService';

export interface ServicoPayload {
  nome: string;
  descricao: string;
  valor: number;
  tipo_cobranca: 'hora' | 'dia';
}

function logarErro(endpoint: string, error: unknown) {
  const { status, mensagem } = extrairErroApi(error);
  logger.error(CONTEXTO, 'Falha na chamada de serviços', {
    endpoint,
    status,
    mensagem,
    mensagemAmigavel: extrairMensagemErro(error),
  });
}

export const servicoService = {
  listarMeus: async (): Promise<ServicoPerfil[]> => {
    const endpoint = '/servicos/meus';
    try {
      logger.info(CONTEXTO, 'Listando serviços do prestador');
      const response = await api.get<ServicoPerfil[]>(endpoint);
      logger.info(CONTEXTO, 'Serviços carregados', {
        total: response.data.length,
      });
      return response.data;
    } catch (error) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  criar: async (payload: ServicoPayload): Promise<ServicoPerfil> => {
    const endpoint = '/servicos';
    try {
      logger.info(CONTEXTO, 'Criando serviço', payload);
      const response = await api.post<ServicoPerfil>(endpoint, payload);
      logger.info(CONTEXTO, 'Serviço criado', {
        servicoId: response.data.id,
      });
      return response.data;
    } catch (error) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  atualizar: async (
    servicoId: number,
    payload: ServicoPayload,
  ): Promise<ServicoPerfil> => {
    const endpoint = `/servicos/${servicoId}`;
    try {
      logger.info(CONTEXTO, 'Atualizando serviço', {
        servicoId,
        payload,
      });
      const response = await api.patch<ServicoPerfil>(endpoint, payload);
      logger.info(CONTEXTO, 'Serviço atualizado', { servicoId });
      return response.data;
    } catch (error) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  remover: async (servicoId: number): Promise<void> => {
    const endpoint = `/servicos/${servicoId}`;
    try {
      logger.info(CONTEXTO, 'Removendo serviço', { servicoId });
      await api.delete(endpoint);
      logger.info(CONTEXTO, 'Serviço removido', { servicoId });
    } catch (error) {
      logarErro(endpoint, error);
      throw error;
    }
  },
};

export default servicoService;
