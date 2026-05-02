import api from '@/service/api';

export interface EmailConfirmacaoStatus {
  email: string;
  email_confirmado: boolean;
}

export interface EmailConfirmacaoResposta {
  email_confirmado?: boolean;
  enviado?: boolean;
  message: string;
  proximo_passo?: string;
}

export const emailConfirmacaoService = {
  confirmarEmail: async (token: string) => {
    const params = new URLSearchParams({ token });

    const response = await api.get<EmailConfirmacaoResposta>(
      `/email/confirmar?${params.toString()}`,
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
