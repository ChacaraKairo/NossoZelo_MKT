import React from 'react';
import styles from './styles/BtnCadastrar.module.css';

const BtnCadastrar = () => {
  return (
    <button
      className={styles.cadastrarButton}
      onClick={() =>
        (window.location.href = '/cadastro-user')
      }
    >
      Cadastrar
    </button>
  );
};

export default BtnCadastrar;
