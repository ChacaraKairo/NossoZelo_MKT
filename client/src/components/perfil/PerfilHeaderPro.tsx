/**
 * @author DevHelper & Sócio
 * @description Header Pro - Foto pequena, limpo e focado na identidade.
 * Substitui o modelo 'Capa de Rede Social'.
 */

import React from 'react';
import { FaCheckCircle, FaStar } from 'react-icons/fa';

interface PerfilHeaderProProps {
  perfil: any;
}

const PerfilHeaderPro: React.FC<PerfilHeaderProProps> = ({
  perfil,
}) => {
  if (!perfil) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
      {/* AVATAR: Pequeno e Blindado (Ring e Sombra Interna) */}
      <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg ring-2 ring-blue-100 mb-4 flex-shrink-0">
        <img
          src={
            perfil?.url_foto_perfil || '/logos/OnlyLogo.png'
          }
          alt="Foto de Perfil"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Identidade */}
      <div className="flex items-center justify-center gap-1.5">
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
          {perfil?.nome.split(' ')[0]}{' '}
          {perfil?.nome.split(' ').slice(-1)}
        </h1>
        {perfil?.verificado && (
          <FaCheckCircle className="text-blue-500 text-sm" />
        )}
      </div>

      <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mt-1 bg-blue-50 px-3 py-1 rounded-full">
        {perfil?.tipo}
      </p>

      {/* Avaliação Suave */}
      <div className="flex items-center justify-center gap-1 mt-3 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
        <FaStar className="text-orange-400 text-sm" />
        <span className="text-slate-700 font-bold text-sm">
          {perfil?.avaliacao_media
            ? Number(perfil.avaliacao_media).toFixed(1)
            : 'Novo'}
        </span>
        <span className="text-slate-400 font-medium text-xs ml-0.5">
          (
          {perfil
            ?.avaliacoes_avaliacoes_prestador_idTousuarios
            ?.length || 0}
          )
        </span>
      </div>
    </div>
  );
};

export default PerfilHeaderPro;
