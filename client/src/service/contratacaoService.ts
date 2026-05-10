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
  | 'nao_realizado'
  | 'negado';

export interface RespostaCancelamentoContratacao {
  contratacao: {
    id: number;
    status: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
    preco: number;
    cancelado_por: 'cliente' | 'prestador' | 'admin';
    cancelado_em: string;
    motivo_cancelamento: string | null;
    cancelamento_tardio: boolean;
  };
  cancelamento: {
    permitido: boolean;
    houve_cobranca_plataforma: false;
    aplica_multa: boolean;
    valor_multa: number;
    horas_ate_servico: number;
    mensagem_usuario: string;
  };
}

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
    dados?: { motivo?: string },
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
          : statusNormalizado === 'nao_realizado'
            ? `/agendamentos/nao-realizado/${contratacaoId}`
          : statusNormalizado === 'cancelado' ||
              statusNormalizado === 'negado'
            ? `/agendamentos/cancelar/${contratacaoId}`
            : null;

    if (!endpoint) {
      const error = criarErroRotaInexistente(
        `Nao existe rota real no backend para atualizar contratacao ${contratacaoId} para status "${status}". ` +
          'As rotas confirmadas hoje sao PATCH /agendamentos/aceitar/:id, PATCH /agendamentos/cancelar/:id, PATCH /agendamentos/nao-realizado/:id e PATCH /agendamentos/finalizar/:id.',
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
        await api.patch<ContratacaoPerfil>(endpoint, dados);

      logarResposta(endpoint, response.status);
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  cancelarContratacao: async (
    contratacaoId: number,
    motivo?: string,
  ): Promise<RespostaCancelamentoContratacao> => {
    const endpoint = `/agendamentos/cancelar/${contratacaoId}`;
    const response = await api.patch<RespostaCancelamentoContratacao>(
      endpoint,
      { motivo },
    );
    return response.data;
  },

  marcarNaoRealizado: async (
    contratacaoId: number,
    motivo: string,
  ): Promise<{ contratacao: ContratacaoPerfil; mensagem_usuario: string }> => {
    const endpoint = `/agendamentos/nao-realizado/${contratacaoId}`;
    const response = await api.patch<{
      contratacao: ContratacaoPerfil;
      mensagem_usuario: string;
    }>(endpoint, { motivo });
    return response.data;
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
