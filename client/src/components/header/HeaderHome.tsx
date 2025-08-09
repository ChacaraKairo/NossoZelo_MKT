import React from 'react';
import Logo from '../logos/LogoLink';
import BtnLogin from '../btn/BtnLogin';
import BtnCadastrar from '../btn/BtnCadastrar';
import styles from './styles/HeaderHome.module.css';

const HeaderHome = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>
      <div className={styles.buttonsWrapper}>
        <BtnLogin />
        <BtnCadastrar />
      </div>
    </header>
  );
};

export default HeaderHome;
