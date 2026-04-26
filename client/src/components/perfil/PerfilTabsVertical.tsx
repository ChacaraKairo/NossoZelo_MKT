import React from 'react';
import {
  FaCalendarAlt,
  FaClipboardList,
  FaHistory,
  FaShieldAlt,
  FaStar,
  FaSuitcase,
  FaUser,
} from 'react-icons/fa';
import styles from '@/styles/components/perfil/PerfilTabsVertical.module.css';
import { PerfilCompleto } from './types/types';

interface PerfilTabsVerticalProps {
  ativa: string;
  setAtiva: (aba: string) => void;
  perfil: PerfilCompleto;
}

const PerfilTabsVertical: React.FC<PerfilTabsVerticalProps> = ({
  ativa,
  setAtiva,
  perfil,
}) => {
  if (!perfil) return null;

  const isPrestador = perfil.tipo !== 'cliente';
  const solicitacoesPendentes = (
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    []
  ).filter((contratacao) => contratacao.status === 'pendente').length;

  const menuItems = [
    {
      id: 'sobre',
      label: 'Meu Perfil',
      description: 'Ver e editar meus dados',
      icon: <FaUser />,
    },
    {
      id: 'solicitacoes',
      label: isPrestador ? 'Pedidos Recebidos' : 'Meus Pedidos',
      description: 'Solicitações e respostas',
      icon: <FaClipboardList />,
    },
    ...(isPrestador
      ? [
          {
            id: 'agenda',
            label: 'Minha Agenda',
            description: 'Gerenciar horários',
            icon: <FaCalendarAlt />,
          },
          {
            id: 'servicos',
            label: 'Meus Serviços',
            description: 'Configurar atendimentos',
            icon: <FaSuitcase />,
          },
        ]
      : []),
    {
      id: 'historico',
      label: 'Histórico',
      description: 'Serviços passados e ativos',
      icon: <FaHistory />,
    },
    {
      id: 'avaliacoes',
      label: 'Avaliações',
      description: 'Feedbacks e reputação',
      icon: <FaStar />,
    },
    {
      id: 'seguranca',
      label: 'Segurança',
      description: 'Senha e sessão',
      icon: <FaShieldAlt />,
    },
  ];

  return (
    <nav className={styles.navContainer}>
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setAtiva(item.id)}
          className={`${styles.tabButton} ${
            ativa === item.id ? styles.tabButtonActive : ''
          }`}
          type="button"
        >
          <span className={styles.icon}>{item.icon}</span>
          <span>
            {item.label}
            <small className={styles.description}>
              {item.description}
            </small>
          </span>

          {/* Badge de Notificação para Pedidos Pendentes */}
          {item.id === 'solicitacoes' &&
            isPrestador &&
            solicitacoesPendentes > 0 && (
            <span className={styles.badge}>
              {solicitacoesPendentes}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default PerfilTabsVertical;
