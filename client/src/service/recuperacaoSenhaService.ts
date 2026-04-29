import api from '@/service/api';

export interface RecuperacaoSenhaResposta {
  message: string;
}

export interface ValidarTokenResposta {
  valido: boolean;
}

export const recuperacaoSenhaService = {
  solicitarRecuperacao: async (email: string) => {
    const response = await api.post<RecuperacaoSenhaResposta>(
      '/login/recuperar-senha',
      { email },
    );
    return response.data;
  },

  validarToken: async (token: string) => {
    const response = await api.get<ValidarTokenResposta>(
      `/login/recuperar-senha/validar-token?token=${encodeURIComponent(
        token,
      )}`,
    );
    return response.data;
  },

  redefinirSenha: async (token: string, novaSenha: string) => {
    const response = await api.post<RecuperacaoSenhaResposta>(
      '/login/redefinir-senha',
      { token, novaSenha },
    );
    return response.data;
  },
};
