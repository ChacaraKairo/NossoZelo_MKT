import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain';
import Style from '@/styles/PrestadoresPage.module.css';
import Filtro from '@/components/main-page/filter/Filtro';
import PrestadoresGrid from '@/components/main-page/prestadores-grid/PrestadoresGrid';
import Footer from '@/components/footer/Footer';
import { useBuscaStore } from '@/store/useBuscaStore';
import { useGeolocalizacao } from '@/hooks/useGeolocalizacao';
import logger from '@/utils/logger';
import ClientOnly from '@/components/common/ClientOnly';

const CONTEXTO = 'PrestadoresPage';

function queryString(valor: string | string[] | undefined) {
  return Array.isArray(valor) ? valor[0] : valor;
}

const PrestadoresPage = () => {
  const router = useRouter();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const filtrosIniciaisAplicados = useRef(false);
  const {
    searchLocation,
    setSearchLocation,
    searchService,
    setSearchService,
    categoria,
    setCategoria,
    distancia,
    setDistancia,
    precoMax,
    setPrecoMax,
  } = useBuscaStore();
  const { solicitarGeolocalizacao } = useGeolocalizacao();

  useEffect(() => {
    logger.info(CONTEXTO, 'Montagem da página');
    solicitarGeolocalizacao();
  }, [solicitarGeolocalizacao]);

  useEffect(() => {
    if (!router.isReady || filtrosIniciaisAplicados.current) return;
    filtrosIniciaisAplicados.current = true;

    const tipo = queryString(router.query.tipo);
    const localizacao = queryString(router.query.localizacao);
    const busca = queryString(router.query.busca);
    const distanciaQuery = queryString(router.query.distancia);
    const precoMaxQuery = queryString(router.query.precoMax);

    logger.info(CONTEXTO, 'Leitura de query params', router.query);

    if (tipo) {
      const categoriaFormatada =
        tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
      logger.info(CONTEXTO, 'Categoria aplicada no Zustand', {
        categoria: categoriaFormatada,
      });
      setCategoria(categoriaFormatada);
    }
    if (localizacao) setSearchLocation(localizacao);
    if (busca) setSearchService(busca);
    if (distanciaQuery) setDistancia(Number(distanciaQuery));
    if (precoMaxQuery) setPrecoMax(precoMaxQuery);
  }, [
    router.isReady,
    router.query,
    setCategoria,
    setDistancia,
    setPrecoMax,
    setSearchLocation,
    setSearchService,
  ]);

  const queryAtualizada = useMemo(() => {
    const query: Record<string, string> = {};
    if (categoria) query.tipo = categoria.toLowerCase();
    if (searchLocation) query.localizacao = searchLocation;
    if (searchService) query.busca = searchService;
    if (distancia !== 50) query.distancia = String(distancia);
    if (precoMax) query.precoMax = precoMax;
    return query;
  }, [categoria, distancia, precoMax, searchLocation, searchService]);

  useEffect(() => {
    if (!router.isReady) return;

    const atual = JSON.stringify(router.query);
    const proxima = JSON.stringify(queryAtualizada);
    if (atual === proxima) return;

    logger.debug(CONTEXTO, 'Sincronizando filtros com URL', queryAtualizada);
    router.replace(
      {
        pathname: '/prestadores',
        query: queryAtualizada,
      },
      undefined,
      { shallow: true },
    );
  }, [queryAtualizada, router]);

  const conteudo = (
    <div className={Style.page}>
      <HeaderMain />
      <main className={Style.mainContainer}>
        <div className={Style.contentWrapper}>
          <button
            type="button"
            className={Style.mobileFilterToggle}
            onClick={() => setFiltrosAbertos((aberto) => !aberto)}
          >
            {filtrosAbertos ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>

          <aside
            className={`${Style.sidebar} ${
              filtrosAbertos ? Style.sidebarOpen : ''
            }`}
          >
            <Filtro />
          </aside>

          <section className={Style.gridArea}>
            <PrestadoresGrid />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <ClientOnly
      fallback={
        <div className={Style.page}>
          <div className={Style.clientFallback}>Carregando busca...</div>
        </div>
      }
    >
      {conteudo}
    </ClientOnly>
  );
};

export default PrestadoresPage;
