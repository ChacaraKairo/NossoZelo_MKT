import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '../logos/LogoLink';
import styles from '@/styles/components/header/HeaderHome.module.css';
import { getUsuarioDoCookie } from '@/utils/auth';
import logger from '@/utils/logger';

interface HeaderHomeProps {
  variant?: 'public' | 'private';
}

const CONTEXTO = 'HeaderHome';

const HeaderHome: React.FC<HeaderHomeProps> = ({
  variant = 'private',
}) => {
  const [usuario, setUsuario] = useState<{ nome: string } | null>(
    null,
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (variant === 'public') return;

    const decoded = getUsuarioDoCookie();
    if (!decoded) return;

    const nomeCompleto = decoded.nome || 'Usuario';
    setUsuario({ nome: nomeCompleto.split(' ')[0] });
  }, [variant]);

  useEffect(() => {
    if (usuario) {
      logger.debug(CONTEXTO, 'Usuario autenticado no header home', {
        nome: usuario.nome,
      });
    }
  }, [usuario]);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.inner}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>

        <nav className={styles.nav} aria-label="Navegacao principal">
          <Link href="/prestadores" className={styles.navLink}>
            Buscar profissionais
          </Link>
          <Link href="/cadastro-prestador" className={styles.navLink}>
            Seja prestador
          </Link>
        </nav>

        <div className={styles.actions}>
          {!isClient ? (
            <div
              className={styles.skeleton}
              aria-label="Carregando acoes"
            />
          ) : variant !== 'public' && usuario ? (
            <>
              <span className={styles.greeting}>Ola, {usuario.nome}</span>
              <Link href="/dashboard" className={styles.primaryLink}>
                Minha area
              </Link>
            </>
          ) : (
            <>
              <Link href="/login-user" className={styles.secondaryLink}>
                Entrar
              </Link>
              <Link href="/cadastro-user" className={styles.primaryLink}>
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;
