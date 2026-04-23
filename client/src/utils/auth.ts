/**
 * @author ZeloArchitect AI & Kairo
 * @description Gerenciador central de sessão com validação de expiração, telemetria
 * e redirecionamento de segurança para destruição de estado (Hard-Reload).
 * @path client/src/utils/auth.ts
 */

export interface UsuarioDecodificado {
  id: string;
  nome: string;
  email?: string;
  tipo: string;
  exp: number; // Claim padrão do JWT para expiração
}

const COOKIE_NAMES = ['zelo_token', 'token'];

/**
 * Resgata o token cru do cookie de forma otimizada.
 */
export const getToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  for (const name of COOKIE_NAMES) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return parts.pop()?.split(';').shift();
  }
  return undefined;
};

/**
 * Encerra a sessão limpando cookies e estados (Storage),
 * seguido de um Hard-Reload para limpar a memória da SPA.
 */
export const logout = (silent: boolean = false) => {
  if (typeof window === 'undefined') return; // Proteção para SSR (Next.js)

  // 1. Limpa todos os cookies de autenticação
  COOKIE_NAMES.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });

  // 2. Limpa dados residuais do navegador (Cache de estado)
  localStorage.clear();
  sessionStorage.clear();

  if (!silent) {
    console.warn(
      '[NossoZelo Auth] - Sessão encerrada manualmente. Redirecionando...',
    );
  } else {
    console.warn(
      '[NossoZelo Auth] - Limpeza silenciosa de sessão (Expirada ou Inválida).',
    );
  }

  // 3. Redirecionamento Forçado (Destrói o estado do Zustand e do React)
  // A trava previne loops infinitos se já estivermos na rota de login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login-user';
  }
};

/**
 * Decodifica o token e valida a integridade e expiração.
 * Referência: Gem de Logs Detalhados para Código.xlsx
 */
export const getUsuarioDoCookie =
  (): UsuarioDecodificado | null => {
    const token = getToken();

    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64)
        throw new Error('Estrutura de token inválida');

      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const decodedJson = decodeURIComponent(
        atob(base64)
          .split('')
          .map(
            (c) =>
              '%' +
              ('00' + c.charCodeAt(0).toString(16)).slice(
                -2,
              ),
          )
          .join(''),
      );

      const usuario = JSON.parse(
        decodedJson,
      ) as UsuarioDecodificado;

      // --- VALIDAÇÃO CRÍTICA DE EXPIRAÇÃO ---
      const agora = Math.floor(Date.now() / 1000);
      if (usuario.exp < agora) {
        console.group('[NossoZelo Log] - Sessão Expirada');
        console.log(`User ID: ${usuario.id}`);
        console.log(
          `Expired At: ${new Date(usuario.exp * 1000).toISOString()}`,
        );
        console.groupEnd();

        // Executa o logout silencioso que agora redireciona automaticamente
        logout(true);
        return null;
      }

      return usuario;
    } catch (error) {
      // Log Detalhado conforme Gem de Logs Detalhados para Código.xlsx
      console.group(
        `[NossoZelo Error] - JWT Decoding Failure`,
      );
      console.error(
        `Timestamp: ${new Date().toISOString()}`,
      );
      console.error(
        `ErrorMessage: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      );
      console.error(
        `TokenHash: ${token.substring(0, 10)}...`,
      );
      console.groupEnd();

      // Token quebrado ou fraudado? Limpa e expulsa o usuário.
      logout(true);
      return null;
    }
  };
