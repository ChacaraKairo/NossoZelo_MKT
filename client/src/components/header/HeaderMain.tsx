import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { TbUserSearch } from 'react-icons/tb';
import Button from '../btn/Button';
import Input from '../inputs/Input';
import Logo from '../logos/LogoLink';
import UserDropdown from './UserDropdown';
import styles from './styles/HeaderMain.module.css';
import { useBuscaStore } from '@/store/useBuscaStore';
import { getUsuarioDoCookie } from '@/utils/auth';
import logger from '@/utils/logger';

const CONTEXTO = 'HeaderMain';

const HeaderMain: React.FC = () => {
  const router = useRouter();
  const {
    searchLocation,
    setSearchLocation,
    searchService,
    setSearchService,
  } = useBuscaStore();
  const [usuario, setUsuario] = useState<{
    nome: string;
    tipo?: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const decoded = getUsuarioDoCookie();
    if (!decoded) return;

    setUsuario({
      nome: decoded.nome || 'Usuario',
      tipo: decoded.tipo,
    });
  }, []);

  const handleBuscar = () => {
    logger.info(CONTEXTO, 'Busca acionada pelo header', {
      searchLocation,
      searchService,
    });

    if (router.pathname !== '/prestadores') {
      router.push('/prestadores');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleBuscar();
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.inner}>
        <div className={styles.logoWrapper}>
          <Logo />
        </div>

        <form
          className={styles.searchBar}
          onSubmit={handleSubmit}
          role="search"
          aria-label="Buscar prestadores"
        >
          <div className={styles.searchField}>
            <Input
              value={searchLocation}
              onChange={(event) =>
                setSearchLocation(event.target.value)
              }
              placeholder="Cidade, bairro ou estado"
              icon={<FaMapMarkerAlt />}
              iconPosition="left"
            />
          </div>

          <div className={styles.separator} aria-hidden="true" />

          <div className={styles.searchField}>
            <Input
              value={searchService}
              onChange={(event) =>
                setSearchService(event.target.value)
              }
              placeholder="Nome, tipo ou especialidade"
              icon={<FaSearch />}
              iconPosition="left"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className={styles.searchButton}
          >
            <TbUserSearch aria-hidden="true" />
            <span>Buscar</span>
          </Button>
        </form>

        <nav className={styles.navLinks} aria-label="Atalhos">
          <Link href="/prestadores" className={styles.navLink}>
            Prestadores
          </Link>
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
        </nav>

        <div className={styles.actions}>
          {!isClient ? (
            <div
              className={styles.userSkeleton}
              aria-label="Carregando usuario"
            />
          ) : usuario ? (
            <UserDropdown />
          ) : (
            <div className={styles.authActions}>
              <Link href="/login-user" className={styles.loginLink}>
                Entrar
              </Link>
              <Link
                href="/cadastro-user"
                className={styles.registerLink}
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderMain;
