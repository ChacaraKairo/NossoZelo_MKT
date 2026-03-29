import React, { useState, useEffect } from 'react';
import Logo from '../logos/LogoLink';
import AuthButtons from './AuthButtons';
import styles from './styles/HeaderHome.module.css';
import { getUsuarioDoCookie } from '@/utils/auth';

interface HeaderHomeProps {
  variant?: 'public' | 'private';
}

const HeaderHome: React.FC<HeaderHomeProps> = ({
  variant = 'private',
}) => {
  // --- ESTADOS DE AUTENTICAÇÃO E HIDRATAÇÃO ---
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Confirma que estamos no navegador

    if (variant === 'public') return;

    const decoded = getUsuarioDoCookie();

    if (decoded) {
      const nomeCompleto = decoded.nome || 'Usuário';
      const primeiroNome = nomeCompleto.split(' ')[0];
      setUsuario({ nome: primeiroNome });
    }
  }, [variant]);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <div className={styles.buttonsWrapper}>
        {/* Evita o "piscar" dos botões durante o carregamento do SSR no Next.js */}
        {!isClient ? (
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div> // Skeleton de loading elegante
        ) : variant === 'public' ? (
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
