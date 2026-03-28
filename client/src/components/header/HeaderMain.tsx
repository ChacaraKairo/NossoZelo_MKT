// file: client/src/components/header/HeaderMain.tsx
'use client';

import React, { useState, useEffect } from 'react';

import styles from './styles/HeaderMain.module.css';

// --- Componentes Reutilizáveis ---

import Input from '../inputs/Input';

// --- Ícones ---
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { TbUserSearch } from 'react-icons/tb';
import LoginButton from '../btn/BtnLogin';
import BtnCadastrar from '../btn/BtnCadastrar';
import Logo from '../logos/LogoLink';
import Button from '../btn/Button';

interface HeaderMainProps {
  onSearch: (searchData: {
    location: string;
    query: string;
  }) => void;
}

const HeaderMain: React.FC<HeaderMainProps> = ({
  onSearch,
}) => {
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');

  // Estado para armazenar os dados do usuário logado
  const [usuario, setUsuario] = useState<{
    nome: string;
  } | null>(null);

  useEffect(() => {
    // Puxando o token dos cookies (ajuste 'token=' se o nome do seu cookie for diferente)
    const tokenCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (tokenCookie) {
      try {
        // Decodificando a carga útil (payload) do JWT
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

        console.log('Conteúdo do Token:', decoded); // <-- Inspecione no F12

        const nomeCompleto =
          decoded.nome || decoded.name || 'Usuário';
        const primeiroNome = nomeCompleto.split(' ')[0];
        setUsuario({
          nome: primeiroNome,
        });
      } catch (error) {
        console.error(
          'Erro ao decodificar o token:',
          error,
        );
      }
    }
  }, []);

  const handleSearch = () => {
    onSearch({ location, query });
    console.log(
      `Buscando por: Local='${location}', Query='${query}'`,
    );
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>

      <div className={styles.searchBar}>
        {/* Input de Localização */}
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Localização"
          icon={<FaMapMarkerAlt />}
          iconPosition="left"
        />

        <div className={styles.separator}></div>

        {/* Input de Busca */}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por nome ou tipo"
          icon={<FaSearch />}
          iconPosition="left"
        />

        {/* Botão de Busca Configurado */}
        <Button
          variant="primary"
          onClick={handleSearch}
          className={styles.searchButton} // Classe específica para estilização
        >
          <TbUserSearch />
          <span>Buscar</span>
        </Button>
      </div>

      <div className={styles.buttonsWrapper}>
        {usuario ? (
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
