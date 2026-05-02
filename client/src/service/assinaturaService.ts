import api from '@/service/api';
import {
  PlanoAssinatura,
  RespostaAssinatura,
  RespostaCancelarAssinatura,
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
    const response = await api.post<RespostaAssinatura>(
      '/assinaturas/iniciar',
      { planoId },
    );
    return response.data;
  },

  listarPlanos: async () => {
    const response = await api.get<PlanoAssinatura[]>(
      '/assinaturas/planos',
    );
    return response.data;
  },

  regularizarAssinatura: async (planoId: number) => {
    const response = await api.post<RespostaAssinatura>(
      '/assinaturas/regularizar',
      { planoId },
    );
    return response.data;
  },

  cancelarAssinatura: async () => {
    const response = await api.post<RespostaCancelarAssinatura>(
      '/assinaturas/cancelar',
    );
    return response.data;
  },
};
