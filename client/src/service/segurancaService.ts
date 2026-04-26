import api, { extrairErroApi } from '@/service/api';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'segurancaService';

export interface AlterarSenhaPayload {
  senhaAtual: string;
  novaSenha: string;
}

export const segurancaService = {
  alterarSenha: async (payload: AlterarSenhaPayload) => {
    const endpoint = '/perfil/seguranca/senha';
    try {
      logger.info(CONTEXTO, 'Solicitando alteração segura de senha');
      const response = await api.patch<{ message: string }>(
        endpoint,
        payload,
      );
      logger.info(CONTEXTO, 'Senha alterada com sucesso');
      return response.data;
    } catch (error) {
      const { status, mensagem } = extrairErroApi(error);
      logger.error(CONTEXTO, 'Falha ao alterar senha', {
        status,
        mensagem,
        mensagemAmigavel: extrairMensagemErro(error),
      });
      throw error;
    }
  },
};

export default segurancaService;
