import api from '@/service/api';
import { AssinaturaAtual } from '@/types/perfil';

export interface StatusAssinaturaPrestador {
  prestador_id: string;
  status_cadastro: string;
  assinatura_atual: AssinaturaAtual | null;
  assinatura_status: string;
  assinatura_confirmacao_expira_em?: string | Date | null;
  perfil_profissional_ativo: boolean;
  pode_aparecer_na_busca: boolean;
  pode_receber_pedidos: boolean;
  motivo_perfil_inativo?: string | null;
}

export interface RespostaAssinaturaMock {
  gateway_resultado: {
    sucesso: boolean;
    status: 'aprovado' | 'pendente' | 'recusado' | 'erro';
    gateway: 'mock' | 'asaas';
    gatewaySubscriptionId?: string;
    gatewayCustomerId?: string;
    mensagem?: string;
    confirmacaoExpiraEm?: string | Date;
  };
  assinatura: AssinaturaAtual;
}

export const assinaturaService = {
  obterMinhaAssinatura: async () => {
    const response =
      await api.get<StatusAssinaturaPrestador>('/assinaturas/minha');
    return response.data;
  },

  obterStatusPrestador: async (prestadorId: string) => {
    const response = await api.get<StatusAssinaturaPrestador>(
      `/assinaturas/status/${prestadorId}`,
    );
    return response.data;
  },

  iniciarAssinaturaMock: async (planoId: number) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/iniciar-mock',
      { planoId },
    );
    return response.data;
  },

  regularizarAssinaturaMock: async (planoId: number) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/regularizar-mock',
      { planoId },
    );
    return response.data;
  },
};
