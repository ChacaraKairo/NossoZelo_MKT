import React from 'react';
import styles from '@/styles/components/btn/BtnCadastrar.module.css';

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
