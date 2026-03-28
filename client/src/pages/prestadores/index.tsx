import React, { useState, useEffect } from 'react';
import HeaderMain from '@/components/header/HeaderMain';
import Style from '@/styles/PrestadoresPage.module.css';
import Filtro from '@/components/main-page/filter/Filtro';
import Footer from '@/components/footer/Footer';
import PrestadoresGrid from '@/components/main-page/prestadores-grid/PrestadoresGrid';

const PrestadoresPage = () => {
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Define a data de expiração para o cookie (ex: 7 dias)
          const diasExp = 7;
          const dataExpiracao = new Date();
          dataExpiracao.setTime(
            dataExpiracao.getTime() +
              diasExp * 24 * 60 * 60 * 1000,
          );
          const expires =
            'expires=' + dataExpiracao.toUTCString();

          // Salva a longitude e latitude nos cookies
          document.cookie = `latitude=${latitude}; ${expires}; path=/`;
          document.cookie = `longitude=${longitude}; ${expires}; path=/`;
        },
        (error) => {
          console.error(
            'Erro ao obter a localização do usuário:',
            error.message,
          );
        },
      );
    } else {
      console.warn(
        'API de geolocalização não é suportada por este navegador.',
      );
    }
  }, []);

  const handleSearch = (searchData: {
    location: string;
    query: string;
  }) => {
    console.log('Busca:', searchData);
  };

  return (
    <div>
      <HeaderMain onSearch={handleSearch} />

      <main
        className={Style.mainContainer}
        style={{
          display: 'flex',
          padding: '20px',
          gap: '20px',
          marginTop: '100px',
        }}
      >
        <aside
          className={Style.sidebar}
          style={{ width: '250px' }}
        >
          <Filtro />
        </aside>

        {/* Grid de Prestadores Componentizado */}
        <PrestadoresGrid />
      </main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
};

export default PrestadoresPage;
