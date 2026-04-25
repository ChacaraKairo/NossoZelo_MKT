import React from 'react';
import logger from '@/utils/logger';

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
    <section className="mx-auto my-10 w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {mensagem}
      </p>
      {detalhes && (
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          {detalhes}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          className="mt-5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          Tentar novamente
        </button>
      )}
    </section>
  );
};

export default ErroComRetry;
