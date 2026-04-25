import React from 'react';
import styles from './styles/Filtro.module.css';
import { useBuscaStore } from '@/store/useBuscaStore';
import logger from '@/utils/logger';

const CONTEXTO = 'Filtro';

const categoriasDisponiveis = [
  'Cuidador',
  'Enfermeiro',
  'Acompanhante',
];

const Filtro = () => {
  const {
    categoria,
    setCategoria,
    distancia,
    setDistancia,
    precoMax,
    setPrecoMax,
    limparBuscaCompleta,
  } = useBuscaStore();

  const filtrosAtivos = Boolean(categoria || precoMax || distancia !== 50);

  const handlePreco = (valor: string) => {
    const numero = Number(valor);
    if (valor && numero < 0) {
      logger.warn(CONTEXTO, 'Preço máximo negativo ignorado', { valor });
      setPrecoMax('0');
      return;
    }
    setPrecoMax(valor);
  };

  const handleAplicar = () => {
    logger.info(CONTEXTO, 'Aplicar filtros acionado', {
      categoria,
      distancia,
      precoMax,
    });
  };

  const handleLimpar = () => {
    logger.info(CONTEXTO, 'Limpar filtros acionado');
    limparBuscaCompleta();
  };

  return (
    <aside className={styles.filterContainer} aria-label="Filtros de busca">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Filtros</h2>
          {filtrosAtivos && (
            <span className={styles.activeBadge}>ativos</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleLimpar}
          className={styles.clearBtn}
        >
          Limpar
        </button>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Especialidade</h3>
        <div className={styles.checkboxGroup}>
          {categoriasDisponiveis.map((cat) => {
            const id = `categoria-${cat.toLowerCase()}`;
            return (
              <label
                key={cat}
                htmlFor={id}
                className={`${styles.checkboxLabel} ${
                  categoria === cat ? styles.checkboxLabelActive : ''
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  className={styles.checkbox}
                  checked={categoria === cat}
                  onChange={() =>
                    setCategoria(categoria === cat ? '' : cat)
                  }
                />
                <span className={styles.checkboxText}>{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>
          Distância <span>Até {distancia} km</span>
        </h3>
        <input
          type="range"
          min="1"
          max="100"
          value={distancia}
          aria-label="Distância máxima"
          onChange={(e) => setDistancia(Number(e.target.value))}
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Preço máximo/hora</h3>
        <label className={styles.priceInputWrapper}>
          <span className={styles.currencySymbol}>R$</span>
          <input
            type="number"
            min="0"
            value={precoMax}
            onChange={(e) => handlePreco(e.target.value)}
            placeholder="0,00"
            className={styles.numberInput}
            aria-label="Preço máximo por hora"
          />
        </label>
      </div>

      <button
        type="button"
        className={styles.applyBtn}
        onClick={handleAplicar}
      >
        Aplicar filtros
      </button>
    </aside>
  );
};

export default Filtro;
