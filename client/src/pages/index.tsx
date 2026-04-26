import React, { useEffect } from 'react';
import HeaderHome from '@/components/header/HeaderHome';
import Escrita from '@/components/inicialpage/Escrita';
import CardGrid from '@/components/inicialpage/CardGrid';
import { useGeolocalizacao } from '@/hooks/useGeolocalizacao';
import styles from '@/styles/HomePage.module.css';

const HomePage: React.FC = () => {
  const { solicitarGeolocalizacao } = useGeolocalizacao();

  useEffect(() => {
    solicitarGeolocalizacao();
  }, [solicitarGeolocalizacao]);

  return (
    <div className={styles.page}>
      <HeaderHome variant="public" />

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <Escrita />
        </section>

        <section className={styles.cardsSection}>
          <CardGrid />
        </section>
      </main>
    </div>
  );
};

export default HomePage;
