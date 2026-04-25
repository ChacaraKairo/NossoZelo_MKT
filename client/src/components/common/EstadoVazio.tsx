import React from 'react';

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
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <h3 className="text-base font-black text-slate-700">{titulo}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {descricao}
      </p>
      {acaoTexto && onAcao && (
        <button
          type="button"
          onClick={onAcao}
          className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700"
        >
          {acaoTexto}
        </button>
      )}
    </div>
  );
}
