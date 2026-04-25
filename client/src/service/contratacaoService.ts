import api, { extrairErroApi } from '@/service/api';
import { ContratacaoPerfil } from '@/types/perfil';
import { getUsuarioDoCookie } from '@/utils/auth';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'contratacaoService';

export type StatusContratacao =
  | 'pendente'
  | 'confirmado'
  | 'aceito'
  | 'concluido'
  | 'concluida'
  | 'cancelado'
  | 'negado';

export interface SolicitarContratacaoPayload {
  cliente_id?: string;
  prestador_id: string;
  tipo_prestador?: string;
  servico_id?: number;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  preco?: number;
  observacoes?: string;
  observacao?: string;
}

function criarErroRotaInexistente(mensagem: string) {
  return new Error(`[TODO tecnico] ${mensagem}`);
}

function logarEndpoint(endpoint: string, dados?: unknown) {
  logger.info(CONTEXTO, 'Endpoint chamado', {
    endpoint,
    dados,
  });
}

function logarResposta(endpoint: string, status: number) {
  logger.info(CONTEXTO, 'Resposta recebida', {
    endpoint,
    status,
  });
}

function logarErro(endpoint: string, error: unknown) {
  const { status, mensagem } = extrairErroApi(error);

  logger.error(CONTEXTO, 'Erro com status HTTP', {
    endpoint,
    status,
    mensagem,
    mensagemAmigavel: extrairMensagemErro(error),
  });
}

export const contratacaoService = {
  solicitarContratacao: async (
    payload: SolicitarContratacaoPayload,
  ): Promise<ContratacaoPerfil> => {
    const endpoint = '/agendamentos';

    try {
      logger.info(CONTEXTO, 'Payload enviado', payload);
      logarEndpoint(endpoint, payload);

      const response = await api.post<ContratacaoPerfil>(
        endpoint,
        payload,
      );

      logarResposta(endpoint, response.status);
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  atualizarStatusContratacao: async (
    contratacaoId: number,
    status: StatusContratacao,
  ): Promise<ContratacaoPerfil> => {
    const statusNormalizado =
      status === 'aceito' || status === 'confirmado'
        ? 'confirmado'
        : status === 'concluida'
          ? 'concluido'
          : status;

    const endpoint =
      statusNormalizado === 'confirmado'
        ? `/agendamentos/aceitar/${contratacaoId}`
        : statusNormalizado === 'concluido'
          ? `/agendamentos/finalizar/${contratacaoId}`
          : statusNormalizado === 'cancelado' ||
              statusNormalizado === 'negado'
            ? `/agendamentos/cancelar/${contratacaoId}`
            : null;

    if (!endpoint) {
      const error = criarErroRotaInexistente(
        `Nao existe rota real no backend para atualizar contratacao ${contratacaoId} para status "${status}". ` +
          'As rotas confirmadas hoje sao PATCH /agendamentos/aceitar/:id, PATCH /agendamentos/cancelar/:id e PATCH /agendamentos/finalizar/:id.',
      );
      logger.error(CONTEXTO, 'Erro com status HTTP', {
        endpoint: '/contratacoes/:id/status',
        status: undefined,
        mensagem: error.message,
      });
      throw error;
    }

    try {
      logger.info(CONTEXTO, 'Payload enviado', {
        contratacaoId,
        status: statusNormalizado,
      });
      logarEndpoint(endpoint, { contratacaoId, status });

      const response =
        await api.patch<ContratacaoPerfil>(endpoint);

      logarResposta(endpoint, response.status);
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  listarMinhasSolicitacoes: async (
    clienteId?: string,
  ): Promise<ContratacaoPerfil[]> => {
    const usuario = getUsuarioDoCookie();
    const id = clienteId || usuario?.id;

    if (!id) {
      const error = criarErroRotaInexistente(
        'Nao foi possivel listar agendamentos sem cliente autenticado.',
      );
      logger.error(CONTEXTO, 'Erro com status HTTP', {
        endpoint: '/agendamentos/cliente/:id',
        status: undefined,
        mensagem: error.message,
      });
      throw error;
    }

    const endpoint = `/agendamentos/cliente/${id}`;

    try {
      logarEndpoint(endpoint, { clienteId: id });

      const response =
        await api.get<ContratacaoPerfil[]>(endpoint);

      logarResposta(endpoint, response.status);
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  listarSolicitacoesPrestador: async (
    prestadorId?: string,
  ): Promise<ContratacaoPerfil[]> => {
    const usuario = getUsuarioDoCookie();
    const id = prestadorId || usuario?.id;

    if (!id) {
      const error = criarErroRotaInexistente(
        'Nao foi possivel listar solicitacoes sem prestador autenticado.',
      );
      logger.error(CONTEXTO, 'Erro com status HTTP', {
        endpoint: '/agendamentos/prestador/:id',
        status: undefined,
        mensagem: error.message,
      });
      throw error;
    }

    const endpoint = `/agendamentos/prestador/${id}`;

    try {
      logarEndpoint(endpoint, { prestadorId: id });

      const response =
        await api.get<ContratacaoPerfil[]>(endpoint);

      logarResposta(endpoint, response.status);
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  aceitar: async (
    contratacaoId: number,
  ): Promise<ContratacaoPerfil> => {
    return contratacaoService.atualizarStatusContratacao(
      contratacaoId,
      'confirmado',
    );
  },

  negar: async (
    contratacaoId: number,
  ): Promise<ContratacaoPerfil> => {
    return contratacaoService.atualizarStatusContratacao(
      contratacaoId,
      'cancelado',
    );
  },
};

export default contratacaoService;
