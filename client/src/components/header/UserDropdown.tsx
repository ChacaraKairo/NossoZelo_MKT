import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FaUserCircle,
  FaHistory,
  FaCalendarAlt,
  FaSignOutAlt,
  FaHandHoldingHeart,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { getUsuarioDoCookie, logout } from '@/utils/auth';

// Importação do CSS Module
import styles from '@/styles/components/header/UserDropdown.module.css';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUsuarioDoCookie();
    setUsuario(user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );
    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
  }, []);

  if (!usuario) return null;

  const isPrestador = usuario.tipo !== 'cliente';
  const nomeUsuario = usuario.nome || 'Usuário';
  const primeiroNome = nomeUsuario.split(' ')[0] || 'Usuário';

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* GATILHO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.triggerButton}
      >
        <div className={styles.textContainer}>
          <span className={styles.userName}>
            {primeiroNome}
          </span>
          <span className={styles.userRole}>
            {isPrestador ? 'Profissional' : 'Cliente'}
          </span>
        </div>

        <div className={styles.iconWrapper}>
          <FaBars
            className={`${styles.menuIcon} ${
              isOpen
                ? styles.menuIconOpen
                : styles.menuIconClosed
            }`}
          />
          <FaTimes
            className={`${styles.closeIcon} ${
              isOpen
                ? styles.closeIconOpen
                : styles.closeIconClosed
            }`}
          />
        </div>
      </button>

      {/* MENU FLUTUANTE */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.menuHeader}>
            <p className={styles.fullName}>
              {nomeUsuario}
            </p>
            <p className={styles.welcomeText}>
              Bem-vindo ao Nosso Zelo
            </p>
          </div>

          <div className={styles.menuBody}>
            <Link
              href="/meu-perfil"
              onClick={() => setIsOpen(false)}
              className={styles.menuItem}
            >
              <div
                className={`${styles.iconBox} ${styles.blueIcon}`}
              >
                <FaUserCircle />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>
                  Meu Perfil
                </span>
                <span className={styles.itemDesc}>
                  Ver e editar meus dados
                </span>
              </div>
            </Link>

            {isPrestador && (
              <>
                <Link
                  href="/perfil/agenda"
                  onClick={() => setIsOpen(false)}
                  className={styles.menuItem}
                >
                  <div
                    className={`${styles.iconBox} ${styles.greenIcon}`}
                  >
                    <FaCalendarAlt />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>
                      Minha Agenda
                    </span>
                    <span className={styles.itemDesc}>
                      Gerenciar horários
                    </span>
                  </div>
                </Link>

                <Link
                  href="/perfil/servicos"
                  onClick={() => setIsOpen(false)}
                  className={styles.menuItem}
                >
                  <div
                    className={`${styles.iconBox} ${styles.purpleIcon}`}
                  >
                    <FaHandHoldingHeart />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>
                      Meus Serviços
                    </span>
                    <span className={styles.itemDesc}>
                      Configurar atendimentos
                    </span>
                  </div>
                </Link>
              </>
            )}

            <Link
              href={isPrestador ? '/perfil/historico' : '/perfil/pedidos'}
              onClick={() => setIsOpen(false)}
              className={styles.menuItem}
            >
              <div
                className={`${styles.iconBox} ${styles.orangeIcon}`}
              >
                <FaHistory />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>
                  {isPrestador
                    ? 'Histórico'
                    : 'Meus Pedidos'}
                </span>
                <span className={styles.itemDesc}>
                  Serviços passados e ativos
                </span>
              </div>
            </Link>
          </div>

          <div className={styles.menuFooter}>
            <button
              onClick={() => logout()}
              className={styles.logoutButton}
            >
              <div className={styles.menuItem}>
                <div
                  className={`${styles.iconBox} ${styles.redIcon}`}
                >
                  <FaSignOutAlt />
                </div>
                <span
                  className={`${styles.itemTitle} ${styles.dangerText}`}
                >
                  Sair da Sessão
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
