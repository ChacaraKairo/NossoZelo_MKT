import React from 'react';
import {
  FaCalendarCheck,
  FaStar,
  FaWallet,
} from 'react-icons/fa';
import styles from './styles/PerfilStatsWidgets.module.css';

interface PerfilStatsWidgetsProps {
  perfil: any;
}

const PerfilStatsWidgets: React.FC<
  PerfilStatsWidgetsProps
> = ({ perfil }) => {
  if (!perfil) return null;

  // Extraímos os dados reais das relações que configuramos no Service_Perfil
  const totalServicos = perfil.servicos?.length || 0;
  const totalAvaliacoes =
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios
      ?.length || 0;
  const notaMedia = perfil.avaliacao_media
    ? Number(perfil.avaliacao_media).toFixed(1)
    : '5.0';

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

      {/* Widget 3: Reputação/Contratos */}
      <div className={styles.widgetCard}>
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
