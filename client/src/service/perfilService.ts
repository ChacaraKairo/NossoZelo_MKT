import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';
const baseURL = `${apiUrl}/nossozelo`;

const api = axios.create({ baseURL });

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login-user';
      }
    }
    return Promise.reject(error);
  },
);

export const perfilService = {
  obterMeuPerfil: async () => {
    try {
      const response = await api.get('/perfil/meu');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  atualizarDadosPerfil: async (dados: any) => {
    try {
      const response = await api.patch(
        '/perfil/update',
        dados,
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  obterVitrinePrestador: async (prestadorId: string) => {
    try {
      const response = await api.get(
        `/perfil/prestador/${prestadorId}`,
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  obterDadosCliente: async (clienteId: string) => {
    try {
      const response = await api.get(
        `/perfil/cliente/${clienteId}`,
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
