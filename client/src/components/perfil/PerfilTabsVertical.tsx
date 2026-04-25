import React from 'react';
import {
  FaUser,
  FaCalendarAlt,
  FaSuitcase,
  FaShieldAlt,
  FaStar, // Ícone para Avaliações
  FaClipboardList, // Ícone para Solicitações/Pedidos
} from 'react-icons/fa';
import styles from './styles/PerfilTabsVertical.module.css';
import { PerfilCompleto } from './types/types'; // 🔥 Tipagem Estrita

interface PerfilTabsVerticalProps {
  ativa: string;
  setAtiva: (aba: string) => void;
  perfil: PerfilCompleto; // 🚀 Adeus, any!
}

const PerfilTabsVertical: React.FC<
  PerfilTabsVerticalProps
> = ({ ativa, setAtiva, perfil }) => {
  if (!perfil) return null;

  // Lógica de visualização baseada no tipo de usuário
  const isPrestador = perfil.tipo !== 'cliente';

  const menuItems = [
    {
      id: 'sobre',
      label: 'Dados Pessoais',
      icon: <FaUser />,
    },
    // Aba de Pedidos/Solicitações (Onde aceita/nega serviços)
    {
      id: 'solicitacoes',
      label: isPrestador
        ? 'Pedidos Recebidos'
        : 'Meus Pedidos',
      icon: <FaClipboardList />,
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
    // Nova Aba de Avaliações
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      icon: <FaStar />,
    },
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

          {/* Badge de Notificação para Pedidos Pendentes */}
          {item.id === 'solicitacoes' && isPrestador && (
            <span className={styles.badge}>Novo</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default PerfilTabsVertical;
