import logger from '@/utils/logger';

export interface UsuarioDecodificado {
  id: string;
  nome: string;
  email?: string;
  tipo: string;
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

export const getToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  for (const name of COOKIE_NAMES) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
  }

  return undefined;
};

export const logout = (silent: boolean = false) => {
  if (typeof window === 'undefined') return;

  COOKIE_NAMES.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

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
  const token = getToken();

  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      throw new Error('Estrutura de token invalida');
    }

    const base64 = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const decodedJson = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (char) =>
            `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
        )
        .join(''),
    );

    const usuario = JSON.parse(decodedJson) as UsuarioDecodificado;

    // Esta leitura no frontend serve apenas para UX. A validacao de
    // seguranca real sempre acontece no backend.
    if (!usuario.exp) {
      logger.warn('auth', 'Token sem exp recebido no frontend');
      logout(true);
      return null;
    }

    const agora = Math.floor(Date.now() / 1000);
    if (usuario.exp < agora) {
      logger.warn('auth', 'Sessao expirada', {
        usuarioId: usuario.id,
        expiradoEm: new Date(usuario.exp * 1000).toISOString(),
      });
      logout(true);
      return null;
    }

    return usuario;
  } catch (error) {
    logger.error('auth', 'Falha ao decodificar JWT no frontend', {
      timestamp: new Date().toISOString(),
      mensagem: error instanceof Error ? error.message : 'Unknown Error',
      tokenHash: `${token.substring(0, 10)}...`,
    });
    logout(true);
    return null;
  }
};
