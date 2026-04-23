import React from 'react';
import {
  FaUser,
  FaCalendarAlt,
  FaSuitcase,
  FaShieldAlt,
  FaBell,
} from 'react-icons/fa';
import styles from './styles/PerfilTabsVertical.module.css';

interface PerfilTabsVerticalProps {
  ativa: string;
  setAtiva: (aba: string) => void;
  perfil: any;
}

const PerfilTabsVertical: React.FC<
  PerfilTabsVerticalProps
> = ({ ativa, setAtiva, perfil }) => {
  if (!perfil) return null;

  // Lógica de visualização baseada no tipo de usuário
  const isPrestador = perfil?.tipo !== 'cliente';

  const menuItems = [
    {
      id: 'sobre',
      label: 'Dados Pessoais',
      icon: <FaUser />,
    },
    ...(isPrestador
      ? [
          {
            id: 'agenda',
            label: 'Minha Agenda',
            icon: <FaCalendarAlt />,
          },
          {
            id: 'servicos',
            label: 'Meus Serviços',
            icon: <FaSuitcase />,
          },
        ]
      : []),
    {
      id: 'seguranca',
      label: 'Segurança',
      icon: <FaShieldAlt />,
    },
  ];

  return (
    <nav className={styles.navContainer}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setAtiva(item.id)}
          className={`${styles.tabButton} ${ativa === item.id ? styles.tabButtonActive : ''}`}
        >
          <span className={styles.icon}>{item.icon}</span>
          {item.label}

          {/* Exemplo de Badge de Notificação (Opcional) */}
          {item.id === 'agenda' && (
            <span className={styles.badge}>Novo</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default PerfilTabsVertical;
