const API_URL_FALLBACK_DEV = 'http://localhost:4000';

export function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (apiUrl) return apiUrl.replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL precisa estar configurada para build de producao.',
    );
  }

  return API_URL_FALLBACK_DEV;
}

export function getNossoZeloApiUrl() {
  return `${getApiUrl()}/nossozelo`;
}
