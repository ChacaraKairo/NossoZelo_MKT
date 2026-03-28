import React, { useState } from 'react';
import styles from './styles/Filtro.module.css'; // Crie este arquivo para estilos

const Filtro = () => {
  const [distancia, setDistancia] = useState(50);

  return (
    <aside className={styles.filterContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Filtros</h2>
        <button className={styles.clearBtn}>Limpar</button>
      </div>

      {/* Grupo: Especialidade */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>
          Especialidade
        </h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Cuidador
            </span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Enfermeiro
            </span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              Acompanhante
            </span>
          </label>
        </div>
      </div>

      {/* Grupo: Distância */}
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
        <div className={styles.rangeLabels}>
          <span>1 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Grupo: Preço */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>
          Preço máximo/hora
        </h3>
        <div className={styles.priceInputWrapper}>
          <span className={styles.currencySymbol}>R$</span>
          <input
            type="number"
            min="0"
            placeholder="0,00"
            className={styles.numberInput}
          />
        </div>
      </div>

      <button className={styles.applyBtn}>
        Aplicar Filtros
      </button>
    </aside>
  );
};

export default Filtro;
