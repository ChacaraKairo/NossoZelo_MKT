import axios from 'axios';
import Cookies from 'js-cookie';
import logger from '@/utils/logger';

const CONTEXTO = 'api';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

export const baseURL = `${apiUrl}/nossozelo`;

export const api = axios.create({ baseURL });

export function extrairErroApi(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { error?: string; message?: string; erro?: string }
      | undefined;
    const mensagem =
      data?.error ||
      data?.message ||
      data?.erro ||
      error.message;

    return { status, mensagem };
  }

  return {
    status: undefined,
    mensagem:
      error instanceof Error
        ? error.message
        : 'Erro desconhecido',
  };
}

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? Cookies.get('token') : undefined;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.debug(CONTEXTO, 'Requisição HTTP preparada', {
      method: config.method,
      url: config.url,
    });

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, mensagem } = extrairErroApi(error);

    if (status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove('token');
      }
      logger.warn(
        CONTEXTO,
        'Resposta 401 recebida. Token removido e usuário redirecionado.',
        { mensagem },
      );

      if (typeof window !== 'undefined') {
        window.location.href = '/login-user';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
