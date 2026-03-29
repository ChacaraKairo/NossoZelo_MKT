// src/utils/auth.ts

export interface UsuarioDecodificado {
  id: string;
  nome: string;
  email?: string;
  tipo?: string;
}

export const getUsuarioDoCookie =
  (): UsuarioDecodificado | null => {
    // Evita erro de 'document is not defined' no SSR do Next.js
    if (typeof document === 'undefined') return null;

    try {
      const tokenCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!tokenCookie) return null;

      const payloadBase64 = tokenCookie.split('.')[1];
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

      return JSON.parse(decodedJson) as UsuarioDecodificado;
    } catch (error) {
      console.error(
        'Erro ao decodificar o token JWT:',
        error,
      );
      return null;
    }
  };
