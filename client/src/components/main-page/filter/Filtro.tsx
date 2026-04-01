// src/components/main-page/filter/Filtro.tsx
import React from 'react';
import styles from './styles/Filtro.module.css';
import { useBuscaStore } from '@/store/useBuscaStore';

const Filtro = () => {
  // Conecta na Store
  const {
    categoria,
    setCategoria,
    distancia,
    setDistancia,
    precoMax,
    setPrecoMax,
    limparFiltros,
  } = useBuscaStore();

  const categoriasDisponiveis = [
    'Cuidador',
    'Enfermeiro',
    'Acompanhante',
  ];

  return (
    <aside className={styles.filterContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filtros</h2>
        <button
          onClick={limparFiltros}
          className={styles.clearBtn}
        >
          Limpar
        </button>
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>
          Especialidade
        </h3>
        <div className={styles.checkboxGroup}>
          {categoriasDisponiveis.map((cat) => (
            <label
              key={cat}
              className={styles.checkboxLabel}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={categoria === cat}
                onChange={() =>
                  setCategoria(categoria === cat ? '' : cat)
                }
              />
              <span className={styles.checkboxText}>
                {cat}
              </span>
            </label>
          ))}
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
          onChange={(e) =>
            setDistancia(Number(e.target.value))
          }
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>
          Preço máximo/hora
        </h3>
        <div className={styles.priceInputWrapper}>
          <span className={styles.currencySymbol}>R$</span>
          <input
            type="number"
            min="0"
            value={precoMax}
            onChange={(e) => setPrecoMax(e.target.value)}
            placeholder="0,00"
            className={styles.numberInput}
          />
        </div>
      </div>
    </aside>
  );
};

export default Filtro;
