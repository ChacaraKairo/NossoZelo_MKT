import React, { useEffect } from 'react';
import HeaderHome from '@/components/header/HeaderHome';
import Escrita from '@/components/inicialpage/Escrita';
import CardGrid from '@/components/inicialpage/CardGrid';
import { useGeolocalizacao } from '@/hooks/useGeolocalizacao';

const HomePage: React.FC = () => {
  const { solicitarGeolocalizacao } = useGeolocalizacao();

  useEffect(() => {
    solicitarGeolocalizacao();
  }, [solicitarGeolocalizacao]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <HeaderHome variant="public" />

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
