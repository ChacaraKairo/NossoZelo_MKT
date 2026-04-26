import React from 'react';
import {
  FaCalendarCheck,
  FaStar,
  FaWallet,
} from 'react-icons/fa';
import styles from '@/styles/components/perfil/PerfilStatsWidgets.module.css';
import { PerfilCompleto } from './types/types'; // 🔥 Tipagem Estrita

interface PerfilStatsWidgetsProps {
  perfil: PerfilCompleto; // 🚀 Adeus, any!
  setAtiva: (aba: string) => void; // 🎯 Nova prop para controlar as abas
}

const PerfilStatsWidgets: React.FC<
  PerfilStatsWidgetsProps
> = ({ perfil, setAtiva }) => {
  if (!perfil) return null;

  // Extraímos os dados reais das relações.
  // O TypeScript agora sabe exatamente o que tem dentro de 'perfil'
  const totalServicos = perfil.servicos?.length || 0;
  const totalAvaliacoes =
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios
      ?.length || 0;

  // Conversão segura do Decimal do Prisma para número formatado
  const notaMedia = perfil.avaliacao_media
    ? Number(perfil.avaliacao_media).toFixed(1)
    : '0.0';

  return (
    <div className={styles.statsGrid}>
      {/* Widget 1: Serviços Ativos */}
      <div className={styles.widgetCard}>
        <div
          className={`${styles.iconWrapper} ${styles.bgBlue}`}
        >
          <FaCalendarCheck />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Serviços</span>
          <span className={styles.value}>
            {totalServicos}
          </span>
        </div>
      </div>

      {/* Widget 2: Avaliação Média */}
      <div className={styles.widgetCard}>
        <div
          className={`${styles.iconWrapper} ${styles.bgOrange}`}
        >
          <FaStar />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Avaliação</span>
          <span className={styles.value}>{notaMedia}</span>
        </div>
      </div>

      {/* Widget 3: Reputação/Feedbacks (Agora Clicável!) */}
      <div
        className={`${styles.widgetCard} cursor-pointer hover:border-blue-200 hover:shadow-md transition-all active:scale-95`}
        onClick={() => setAtiva('avaliacoes')}
        title="Clique para ver todas as avaliações"
      >
        <div
          className={`${styles.iconWrapper} ${styles.bgGreen}`}
        >
          <FaWallet />
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Feedbacks</span>
          <span className={styles.value}>
            {totalAvaliacoes}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerfilStatsWidgets;
