import React from 'react';
import HeaderHome from '@/components/header/HeaderHome';
import Escrita from '@/components/inicialpage/Escrita';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/data/service';
import CardGrid from '@/components/inicialpage/CardGrid';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeaderHome />

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
