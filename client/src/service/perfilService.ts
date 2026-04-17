/**
 * @author DevHelper (ZeloArchitect AI)
 * @description Serviço responsável por consumir as rotas de perfil do backend.
 * @path client/src/service/perfilService.ts
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';
const baseURL = `${apiUrl}/nossozelo`;

// Configuração do Axios com interceptor para injetar o Token em todas as chamadas
const api = axios.create({ baseURL });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.interceptors.request.use((config: any) => {
  const token = Cookies.get('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: any) => response,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error: any) => {
    // Se o token for inválido/expirado, desloga o usuário por segurança
    if (error.response && error.response.status === 401) {
      console.warn(
        '[ERRO-FRONTEND] Sessão expirada ou inválida. Redirecionando...',
      );
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const perfilService = {
  /**
   * Busca os dados completos do usuário logado (Telas A e B - Autogestão).
   */
  obterMeuPerfil: async () => {
    console.log(
      '[LOG-FLUXO] Buscando dados da visão privada do usuário (/perfil/meu).',
    );
    const response = await api.get('/perfil/meu');
    return response.data;
  },

  /**
   * Busca os dados públicos de um prestador para a Vitrine (Tela D).
   */
  obterVitrinePrestador: async (prestadorId: string) => {
    console.log(
      `[LOG-FLUXO] Buscando vitrine do prestador ${prestadorId}.`,
    );
    const response = await api.get(
      `/perfil/prestador/${prestadorId}`,
    );
    return response.data;
  },

  /**
   * Lógica do Privacy Gate: Busca contato do cliente se houver serviço confirmado (Tela C).
   */
  obterDadosCliente: async (clienteId: string) => {
    console.log(
      `[LOG-FLUXO] Solicitando dados de triagem do cliente ${clienteId}.`,
    );
    const response = await api.get(
      `/perfil/cliente/${clienteId}`,
    );
    return response.data;
  },
};
