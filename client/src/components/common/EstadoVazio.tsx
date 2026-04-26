import React from 'react';
import styles from '@/styles/components/common/Common.module.css';

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  acaoTexto?: string;
  onAcao?: () => void;
}

export default function EstadoVazio({
  titulo,
  descricao,
  acaoTexto,
  onAcao,
}: EstadoVazioProps) {
  return (
    <div className={styles.emptyState}>
      <h3 className={styles.emptyTitle}>{titulo}</h3>
      <p className={styles.emptyDescription}>
        {descricao}
      </p>
      {acaoTexto && onAcao && (
        <button
          type="button"
          onClick={onAcao}
          className={styles.primaryAction}
        >
          {acaoTexto}
        </button>
      )}
    </div>
  );
}
