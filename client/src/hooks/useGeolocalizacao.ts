import { useCallback, useState } from 'react';
import logger from '@/utils/logger';

type GeoStatus =
  | 'idle'
  | 'loading'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

const CONTEXTO = 'useGeolocalizacao';

function salvarCoordenadas(latitude: number, longitude: number) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('latitude', String(latitude));
  localStorage.setItem('longitude', String(longitude));

  const dataExpiracao = new Date();
  dataExpiracao.setTime(dataExpiracao.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expires = `expires=${dataExpiracao.toUTCString()}`;

  document.cookie = `latitude=${latitude}; ${expires}; path=/`;
  document.cookie = `longitude=${longitude}; ${expires}; path=/`;
}

export function useGeolocalizacao() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const solicitarGeolocalizacao = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      logger.warn(CONTEXTO, 'Geolocalização não suportada');
      setStatus('unsupported');
      return;
    }

    setStatus('loading');
    setError(null);
    logger.info(CONTEXTO, 'Solicitando geolocalização');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        salvarCoordenadas(latitude, longitude);
        logger.info(CONTEXTO, 'Geolocalização autorizada', {
          latitude,
          longitude,
        });
        setStatus('granted');
      },
      (geoError) => {
        const denied = geoError.code === geoError.PERMISSION_DENIED;
        logger.warn(CONTEXTO, denied ? 'Geolocalização negada' : 'Erro de geolocalização', {
          mensagem: geoError.message,
        });
        setError(geoError.message);
        setStatus(denied ? 'denied' : 'error');
      },
    );
  }, []);

  return {
    status,
    error,
    solicitarGeolocalizacao,
  };
}

export default useGeolocalizacao;
