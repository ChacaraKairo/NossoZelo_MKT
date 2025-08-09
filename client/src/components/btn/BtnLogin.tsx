import React from 'react';
import styles from './styles/BtnLogin.module.css';
import { VscAccount } from 'react-icons/vsc';

const LoginButton = () => {
  return (
    <button
      className={styles.loginButton}
      onClick={() => (window.location.href = '/login-user')}
    >
      <VscAccount className={styles.icon} />
      Login
    </button>
  );
};

export default LoginButton;
