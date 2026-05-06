import axios from 'axios';
import logger from '@/utils/logger';
import { logout } from '@/utils/auth';

const CONTEXTO = 'api';

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';
const apiTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

export const baseURL = `${apiUrl}/nossozelo`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: Number.isFinite(apiTimeout) && apiTimeout > 0 ? apiTimeout : 15000,
});

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
        logout(true);
      }
      logger.warn(
        CONTEXTO,
        'Resposta 401 recebida. Token removido e usuário redirecionado.',
        { mensagem },
      );
    }

    return Promise.reject(error);
  },
);

export default api;
