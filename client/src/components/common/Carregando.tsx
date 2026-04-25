import React from 'react';

interface CarregandoProps {
  mensagem?: string;
}

export default function Carregando({
  mensagem = 'Carregando...',
}: CarregandoProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-sm font-bold text-slate-500">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-teal-100 border-t-teal-600"
      />
      <span>{mensagem}</span>
    </div>
  );
}
