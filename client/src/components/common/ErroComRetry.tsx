import React from 'react';
import logger from '@/utils/logger';

interface ErroComRetryProps {
  titulo: string;
  mensagem: string;
  onRetry: () => void;
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
    onRetry();
  };

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '40px auto',
        padding: '24px',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        background: '#ffffff',
        boxShadow: '0 10px 25px -12px rgba(15, 23, 42, 0.2)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          margin: '0 0 8px',
          color: '#0f172a',
          fontSize: '20px',
          fontWeight: 800,
        }}
      >
        {titulo}
      </h2>
      <p
        style={{
          margin: 0,
          color: '#475569',
          fontSize: '14px',
          lineHeight: 1.6,
        }}
      >
        {mensagem}
      </p>

      {detalhes && (
        <p
          style={{
            margin: '12px 0 0',
            color: '#94a3b8',
            fontSize: '12px',
            lineHeight: 1.5,
          }}
        >
          {detalhes}
        </p>
      )}

      <button
        type="button"
        onClick={handleRetry}
        style={{
          marginTop: '18px',
          padding: '10px 16px',
          border: 0,
          borderRadius: '10px',
          background: '#008b8b',
          color: '#ffffff',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Tentar novamente
      </button>
    </section>
  );
};

export default ErroComRetry;
