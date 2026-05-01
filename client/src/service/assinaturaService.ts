import api from '@/service/api';
import {
  CartaoAssinaturaPayload,
  RespostaAssinaturaMock,
  RespostaCancelarAssinatura,
  RespostaTrocarCartaoMock,
  StatusAssinaturaPrestador,
} from '@/types/assinatura';

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

  iniciarAssinatura: async (planoId: number) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/iniciar',
      { planoId },
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

  regularizarAssinatura: async (planoId: number) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/regularizar',
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

  regularizarAssinaturaComCartao: async (
    payload: CartaoAssinaturaPayload,
  ) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/regularizar',
      payload,
    );
    return response.data;
  },

  regularizarAssinaturaComCartaoMock: async (
    payload: CartaoAssinaturaPayload,
  ) => {
    const response = await api.post<RespostaAssinaturaMock>(
      '/assinaturas/regularizar-mock',
      payload,
    );
    return response.data;
  },

  trocarCartaoAssinaturaMock: async (
    payload: CartaoAssinaturaPayload,
  ) => {
    const response = await api.post<RespostaTrocarCartaoMock>(
      '/assinaturas/trocar-cartao-mock',
      payload,
    );
    return response.data;
  },

  cancelarAssinatura: async () => {
    const response = await api.post<RespostaCancelarAssinatura>(
      '/assinaturas/cancelar',
    );
    return response.data;
  },

  cancelarAssinaturaMock: async () => {
    const response = await api.post<RespostaCancelarAssinatura>(
      '/assinaturas/cancelar-mock',
    );
    return response.data;
  },
};
