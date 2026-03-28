import React, { useState, useEffect } from 'react';
import Logo from '../logos/LogoLink';
import AuthButtons from './AuthButtons';
import styles from './styles/HeaderHome.module.css';

interface HeaderHomeProps {
  // Define se o header deve agir como público (sempre botões) ou privado (tenta mostrar usuário)
  variant?: 'public' | 'private';
}

const HeaderHome: React.FC<HeaderHomeProps> = ({
  variant = 'private',
}) => {
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);

  useEffect(() => {
    // Se a página for estritamente pública, nem perdemos tempo processando o cookie
    if (variant === 'public') return;

    const tokenCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (tokenCookie) {
      try {
        const payloadBase64 = tokenCookie.split('.')[1];
        const base64 = payloadBase64
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const decodedJson = decodeURIComponent(
          atob(base64)
            .split('')
            .map(
              (c) =>
                '%' +
                ('00' + c.charCodeAt(0).toString(16)).slice(
                  -2,
                ),
            )
            .join(''),
        );
        const decoded = JSON.parse(decodedJson);

        const nomeCompleto =
          decoded.nome || decoded.name || 'Usuário';
        const primeiroNome = nomeCompleto.split(' ')[0];

        setUsuario({ nome: primeiroNome });
      } catch (error) {
        console.error(
          'Erro ao decodificar o token:',
          error,
        );
      }
    }
  }, [variant]); // O useEffect reage caso a prop mude

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>
      <div className={styles.buttonsWrapper}>
        {/* Lógica de exibição baseada na variante e no estado */}
        {variant === 'public' ? (
          <AuthButtons />
        ) : usuario ? (
          <span className={styles.saudacao}>
            Olá {usuario.nome}, estamos a sua disposição
          </span>
        ) : (
          <AuthButtons />
        )}
      </div>
    </header>
  );
};

export default HeaderHome;
