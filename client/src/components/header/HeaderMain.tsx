// file: client/src/components/header/HeaderMain.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './styles/HeaderMain.module.css';

// --- Componentes Reutilizáveis ---
import Input from '../inputs/Input';
import LoginButton from '../btn/BtnLogin';
import BtnCadastrar from '../btn/BtnCadastrar';
import Logo from '../logos/LogoLink';
import Button from '../btn/Button';
import UserDropdown from './UserDropdown'; // 🔥 IMPORTAMOS O NOVO COMPONENTE

// --- Ícones ---
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { TbUserSearch } from 'react-icons/tb';

// --- Lógica Sênior ---
import { useBuscaStore } from '@/store/useBuscaStore';
import { getUsuarioDoCookie } from '@/utils/auth';
import logger from '@/utils/logger';

const CONTEXTO = 'HeaderMain';

const HeaderMain: React.FC = () => {
  const router = useRouter();
  // 1. Conexão direta com a "Mente" da Busca (Store)
  const {
    searchLocation,
    setSearchLocation,
    searchService,
    setSearchService,
  } = useBuscaStore();

  // 2. Estados de Controle de Autenticação e Hidratação
  const [usuario, setUsuario] = useState<{
    nome: string;
    tipo?: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const decoded = getUsuarioDoCookie();
    if (decoded) {
      const nomeCompleto = decoded.nome || 'Usuário';
      const primeiroNome = nomeCompleto.split(' ')[0];
      setUsuario({
        nome: primeiroNome,
        tipo: decoded.tipo,
      });
    }
  }, []);

  const handleBuscar = () => {
    logger.info(CONTEXTO, 'Botão Buscar acionado', {
      searchLocation,
      searchService,
    });

    if (router.pathname !== '/prestadores') {
      router.push('/prestadores');
    }
  };

  return (
    <header className={styles.headerContainer}>
      {/* O Logo agora empurra a busca, não fica em cima dela */}
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <div className={styles.searchBar}>
        <Input
          value={searchLocation}
          onChange={(e) =>
            setSearchLocation(e.target.value)
          }
          placeholder="Localização"
          icon={<FaMapMarkerAlt />}
          iconPosition="left"
        />

        <div className={styles.separator}></div>

        <Input
          value={searchService}
          onChange={(e) => setSearchService(e.target.value)}
          placeholder="Busque por nome ou tipo"
          icon={<FaSearch />}
          iconPosition="left"
        />

        <Button
          variant="primary"
          onClick={handleBuscar}
          className={styles.searchButton}
        >
          <TbUserSearch />
          <span className="hidden md:inline">Buscar</span>
        </Button>
      </div>

      <div className={styles.buttonsWrapper}>
        {!isClient ? (
          <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full"></div>
        ) : usuario ? (
          <UserDropdown />
        ) : (
          <div className="flex gap-4">
            <LoginButton />
            <BtnCadastrar />
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderMain;
