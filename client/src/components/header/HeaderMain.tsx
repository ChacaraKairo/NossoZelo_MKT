// file: client/src/components/header/HeaderMain.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './styles/HeaderMain.module.css';

// --- Componentes Reutilizáveis ---
import Input from '../inputs/Input';
import LoginButton from '../btn/BtnLogin';
import BtnCadastrar from '../btn/BtnCadastrar';
import Logo from '../logos/LogoLink';
import Button from '../btn/Button';

// --- Ícones ---
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { TbUserSearch } from 'react-icons/tb';

// --- Lógica Sênior ---
import { useBuscaStore } from '@/store/useBuscaStore'; // ✅ Zustand
import { getUsuarioDoCookie } from '@/utils/auth'; // ✅ Utilitário de Auth

// Não precisamos mais da prop onSearch! O componente agora é independente.
const HeaderMain: React.FC = () => {
  // ✅ 1. Conexão direta com a "Mente" da Busca (Store)
  const {
    searchLocation,
    setSearchLocation,
    searchService,
    setSearchService,
  } = useBuscaStore();

  // ✅ 2. Estados de Controle de Autenticação e Hidratação
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Evita o erro de hidratação (SSR vs Client)

    const decoded = getUsuarioDoCookie();
    if (decoded) {
      const nomeCompleto = decoded.nome || 'Usuário';
      const primeiroNome = nomeCompleto.split(' ')[0];
      setUsuario({ nome: primeiroNome });
    }
  }, []);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <div className={styles.searchBar}>
        {/* Input de Localização conectado ao Zustand */}
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

        {/* Input de Busca conectado ao Zustand */}
        <Input
          value={searchService}
          onChange={(e) => setSearchService(e.target.value)}
          placeholder="Busque por nome ou tipo"
          icon={<FaSearch />}
          iconPosition="left"
        />

        {/* Botão de Busca: Mantido pela UX, mas a busca já é reativa 
            enquanto o usuário digita (graças ao Debounce no Grid!) */}
        <Button
          variant="primary"
          onClick={() =>
            console.log('Buscando via Store...')
          }
          className={styles.searchButton}
        >
          <TbUserSearch />
          <span>Buscar</span>
        </Button>
      </div>

      <div className={styles.buttonsWrapper}>
        {/* Renderização Condicional Limpa e sem "piscar" na tela */}
        {!isClient ? (
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        ) : usuario ? (
          <span className={styles.saudacao}>
            Olá {usuario.nome}, estamos a sua disposição
          </span>
        ) : (
          <>
            <LoginButton />
            <BtnCadastrar />
          </>
        )}
      </div>
    </header>
  );
};

export default HeaderMain;
