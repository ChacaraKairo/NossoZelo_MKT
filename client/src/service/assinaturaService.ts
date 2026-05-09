import api from '@/service/api';
import {
  DadosPagamentoAssinatura,
  PlanoAssinatura,
  RespostaAssinatura,
  RespostaCancelarAssinatura,
} from '@/types/assinatura';

export const assinaturaService = {
  obterMinhaAssinatura: async () => {
    const response =
      await api.get<RespostaAssinatura>('/assinaturas/minha');
    return response.data;
  },

  obterStatusPrestador: async (prestadorId: string) => {
    const response = await api.get<RespostaAssinatura>(
      `/assinaturas/status/${prestadorId}`,
    );
    return response.data;
  },

  iniciarAssinatura: async (
    planoId: number,
    dadosPagamento?: DadosPagamentoAssinatura,
  ) => {
    const response = await api.post<RespostaAssinatura>(
      '/assinaturas/iniciar',
      { planoId, dadosPagamento },
    );
    return response.data;
  },

  listarPlanos: async () => {
    const response = await api.get<PlanoAssinatura[]>(
      '/assinaturas/planos',
    );
    return response.data;
  },

  regularizarAssinatura: async (
    planoId: number,
    dadosPagamento?: DadosPagamentoAssinatura,
  ) => {
    const response = await api.post<RespostaAssinatura>(
      '/assinaturas/regularizar',
      { planoId, dadosPagamento },
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
