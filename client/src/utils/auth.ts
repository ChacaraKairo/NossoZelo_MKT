/**
 * @author DevHelper (ZeloArchitect AI) & Kairo
 * @description Gerenciador central de sessão e decodificação JWT.
 * @path client/src/utils/auth.ts
 */

export interface UsuarioDecodificado {
  id: string;
  nome: string;
  email?: string;
  tipo: string; // Necessário e obrigatório para o withAuth HOC
}

/**
 * Resgata o token cru do cookie, suportando o nome antigo e o novo padrão seguro.
 */
export const getToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  const token =
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('zelo_token='))
      ?.split('=')[1] ||
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

  return token;
};

/**
 * Encerra a sessão de forma segura limpando os cookies.
 */
export const logout = () => {
  if (typeof document !== 'undefined') {
    document.cookie =
      'zelo_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login-user';
  }
};

/**
 * Decodifica o token e retorna os dados públicos do usuário logado.
 */
export const getUsuarioDoCookie =
  (): UsuarioDecodificado | null => {
    const tokenCookie = getToken();

    if (!tokenCookie) return null;

    try {
      const payloadBase64 = tokenCookie.split('.')[1];
      const base64 = payloadBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      // Decodificação segura para caracteres UTF-8
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

      return JSON.parse(decodedJson) as UsuarioDecodificado;
    } catch (error) {
      console.error(
        '[ERRO-FRONTEND] Erro ao decodificar o token JWT:',
        error,
      );
      // Se o token estiver corrompido, limpa a sujeira do navegador
      logout();
      return null;
    }
  };
