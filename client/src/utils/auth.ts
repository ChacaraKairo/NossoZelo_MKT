import { getNossoZeloApiUrl } from '@/config/api';
import logger from '@/utils/logger';

export interface UsuarioDecodificado {
  id: string;
  nome: string;
  email?: string;
  tipo: string;
  email_confirmado?: boolean;
  exp?: number;
}

const COOKIE_NAMES = ['zelo_token', 'token'];
const STORAGE_KEYS_SESSAO = [
  'token',
  'zelo_token',
  'usuario',
  'user',
  'auth',
  'nossozelo_usuario',
];
const USUARIO_CACHE_KEY = 'nossozelo_usuario';

export const getToken = (): string | undefined => {
  // Sessao de usuario usa cookie HttpOnly definido pelo backend.
  // JWT nao deve ficar acessivel ao JavaScript.
  return undefined;
};

export const logout = (silent: boolean = false) => {
  if (typeof window === 'undefined') return;

  COOKIE_NAMES.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  fetch(
    `${getNossoZeloApiUrl()}/login/logout`,
    { method: 'POST', credentials: 'include' },
  ).catch(() => undefined);

  STORAGE_KEYS_SESSAO.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  logger.warn(
    'auth',
    silent
      ? 'Limpeza silenciosa de sessao expirada ou invalida.'
      : 'Sessao encerrada manualmente. Redirecionando...',
  );

  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login-user';
  }
};

export const getUsuarioDoCookie = (): UsuarioDecodificado | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cache = sessionStorage.getItem(USUARIO_CACHE_KEY);
    return cache ? (JSON.parse(cache) as UsuarioDecodificado) : null;
  } catch {
    logger.debug('auth', 'Cache local de usuario invalido.');
    return null;
  }
};
