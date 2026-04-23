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
import styles from './styles/UserDropdown.module.css';

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

  return (
    <div className={styles.container} ref={dropdownRef}>
      {/* GATILHO */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.triggerButton}
      >
        <div className={styles.textContainer}>
          <span className={styles.userName}>
            {usuario.nome.split(' ')[0]}
          </span>
          <span className={styles.userRole}>
            {isPrestador ? 'Profissional' : 'Cliente'}
          </span>
        </div>

        <div className={styles.iconWrapper}>
          <FaBars
            style={{
              opacity: isOpen ? 0 : 1,
              transform: isOpen
                ? 'rotate(90deg) scale(0.5)'
                : 'rotate(0) scale(1)',
              transition: 'all 0.3s',
            }}
          />
          <FaTimes
            style={{
              position: 'absolute',
              opacity: isOpen ? 1 : 0,
              transform: isOpen
                ? 'rotate(0) scale(1)'
                : 'rotate(-90deg) scale(0.5)',
              transition: 'all 0.3s',
            }}
          />
        </div>
      </button>

      {/* MENU FLUTUANTE */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.menuHeader}>
            <p className={styles.fullName}>
              {usuario.nome}
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
                  href="/agenda"
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
                  href="/meus-servicos"
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
              href="/historico"
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
                  className={`${styles.itemTitle}`}
                  style={{ color: '#dc2626' }}
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
