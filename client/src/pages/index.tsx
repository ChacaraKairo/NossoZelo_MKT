import React, { useEffect } from 'react';
import HeaderHome from '@/components/header/HeaderHome';
import Escrita from '@/components/inicialpage/Escrita';
import CardGrid from '@/components/inicialpage/CardGrid';

const HomePage: React.FC = () => {
  useEffect(() => {
    // Pede a localização do usuário ao montar o componente
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(
            'Localização permitida. Coordenadas:',
            {
              latitude,
              longitude,
            },
          );

          // Salva a latitude e longitude no localStorage para uso em outras páginas
          localStorage.setItem(
            'latitude',
            latitude.toString(),
          );
          localStorage.setItem(
            'longitude',
            longitude.toString(),
          );
        },
        (error) => {
          console.error(
            'Erro ao obter a localização ou permissão negada:',
            error.message,
          );
        },
      );
    } else {
      console.warn(
        'Geolocalização não é suportada por este navegador.',
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Passando a variante pública para forçar os botões */}
      <HeaderHome variant="public" />

      <main>
        <div>
          <Escrita />
        </div>
        <div>
          <CardGrid />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
