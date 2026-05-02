import api from '@/service/api';
import {
  ConfirmacaoPagamentoCadastroPayload,
  MetodoPagamentoAssinatura,
} from '@/types/assinatura';

export interface EmailConfirmacaoStatus {
  email: string;
  email_confirmado: boolean;
}

export interface EmailConfirmacaoResposta {
  email_confirmado?: boolean;
  enviado?: boolean;
  message: string;
  pagamento_cadastro?: {
    criada?: boolean;
    gateway_resultado?: {
      sucesso: boolean;
      status: 'aprovado' | 'pendente' | 'recusado' | 'erro';
      gateway: 'asaas';
      gatewaySubscriptionId?: string;
      gatewayCustomerId?: string;
      gatewayPaymentId?: string;
      invoiceUrl?: string | null;
      bankSlipUrl?: string | null;
      pixQrCode?: {
        encodedImage?: string | null;
        payload?: string | null;
        expirationDate?: string | null;
      } | null;
      mensagem?: string;
      confirmacaoExpiraEm?: string | Date;
    };
    message?: string;
  } | null;
  aviso_pagamento?: string | null;
}

export const emailConfirmacaoService = {
  confirmarEmail: async (
    token: string,
    metodoPagamento?: MetodoPagamentoAssinatura,
  ) => {
    const params = new URLSearchParams({ token });
    if (metodoPagamento) params.set('metodo_pagamento', metodoPagamento);

    const response = await api.get<EmailConfirmacaoResposta>(
      `/email/confirmar?${params.toString()}`,
    );
    return response.data;
  },

  confirmarEmailComPagamento: async (
    payload: ConfirmacaoPagamentoCadastroPayload,
  ) => {
    const response = await api.post<EmailConfirmacaoResposta>(
      '/email/confirmar',
      payload,
    );
    return response.data;
  },

  reenviarConfirmacao: async () => {
    const response = await api.post<EmailConfirmacaoResposta>(
      '/email/reenviar-confirmacao',
    );
    return response.data;
  },

  obterStatus: async () => {
    const response =
      await api.get<EmailConfirmacaoStatus>('/email/status');
    return response.data;
  },
};
