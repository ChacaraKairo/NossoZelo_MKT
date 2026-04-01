import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain'; // ⚠️ Certifique-se de que este é o header conectado ao Zustand
import Style from '@/styles/PrestadoresPage.module.css';
import Filtro from '@/components/main-page/filter/Filtro';
import PrestadoresGrid from '@/components/main-page/prestadores-grid/PrestadoresGrid';
import Footer from '@/components/footer/Footer';
import { useBuscaStore } from '@/store/useBuscaStore'; // ✅ Lógica de busca

const NossoZeloHome = () => {
  const router = useRouter();
  const setCategoria = useBuscaStore(
    (state) => state.setCategoria,
  );

  // ✅ 1. LÓGICA DO ZUSTAND: Lê a URL na montagem (Ex: /home?tipo=enfermeiro) e joga na Store
  useEffect(() => {
    if (router.isReady) {
      const { tipo } = router.query;
      if (tipo) {
        const categoriaFormatada =
          (tipo as string).charAt(0).toUpperCase() +
          (tipo as string).slice(1).toLowerCase();
        setCategoria(categoriaFormatada);
      }
    }
  }, [router.isReady, router.query, setCategoria]);

  // ✅ 2. LÓGICA DE GEOLOCALIZAÇÃO: Salva latitude/longitude em cookies (Trazido da sua pág de prestadores)
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

  return (
    <div>
      {/* Header: Retiramos o onSearch={} pois o HeaderMain agora 
        deve se comunicar direto com o Zustand (useBuscaStore) 
      */}
      <HeaderMain />

      {/* 🎨 ESTRUTURA VISUAL CORRETA (Copiada da página Prestadores) */}
      <main
        className={Style.mainContainer}
        style={{
          display: 'flex',
          padding: '20px',
          gap: '20px',
          marginTop: '100px',
        }}
      >
        {/* Sidebar com o Filtro */}
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
        <Footer />
      </footer>
    </div>
  );
};

export default NossoZeloHome;
