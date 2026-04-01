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
            { latitude, longitude },
          );

          // 1. Salva em LocalStorage (como você já tinha)
          localStorage.setItem(
            'latitude',
            latitude.toString(),
          );
          localStorage.setItem(
            'longitude',
            longitude.toString(),
          );

          // 2. 🔥 PADRÃO SÊNIOR: Salva também em Cookies (Igual fizemos na página de busca)
          const diasExp = 7;
          const dataExpiracao = new Date();
          dataExpiracao.setTime(
            dataExpiracao.getTime() +
              diasExp * 24 * 60 * 60 * 1000,
          );
          const expires =
            'expires=' + dataExpiracao.toUTCString();

          document.cookie = `latitude=${latitude}; ${expires}; path=/`;
          document.cookie = `longitude=${longitude}; ${expires}; path=/`;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Passando a variante pública para forçar os botões */}
      <HeaderHome variant="public" />

      {/* 🔥 MÁGICA RESPONSIVA: 
          flex-grow (empurra o footer pro fundo), 
          max-w-7xl (limita a largura no PC), 
          mx-auto (centra), 
          px-4 (borda no telemóvel), 
          sm:px-6 lg:px-8 (bordas maiores no tablet/PC) 
      */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12">
        <section className="w-full flex justify-center">
          <Escrita />
        </section>

        <section className="w-full">
          <CardGrid />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
