import React from 'react';
import logger from '@/utils/logger';
import styles from '@/styles/components/common/Common.module.css';

interface ErroComRetryProps {
  titulo: string;
  mensagem: string;
  onRetry?: () => void;
  detalhes?: string;
}

const ErroComRetry: React.FC<ErroComRetryProps> = ({
  titulo,
  mensagem,
  onRetry,
  detalhes,
}) => {
  const handleRetry = () => {
    logger.info('ErroComRetry', 'Usuário clicou em tentar novamente', {
      titulo,
      detalhes,
    });
    onRetry?.();
  };

  return (
    <section className={styles.errorBox}>
      <h2 className={styles.errorTitle}>{titulo}</h2>
      <p className={styles.errorMessage}>
        {mensagem}
      </p>
      {detalhes && (
        <p className={styles.errorDetails}>
          {detalhes}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          className={styles.primaryAction}
        >
          Tentar novamente
        </button>
      )}
    </section>
  );
};

export default ErroComRetry;
