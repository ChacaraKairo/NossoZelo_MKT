import React from 'react';
import {
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaCalendarDay,
} from 'react-icons/fa';

const PerfilSidebar = ({ perfil }: { perfil: any }) => {
  return (
    <div className="lg:col-span-4 space-y-6">
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FaQuoteLeft className="text-blue-500 text-xs" />{' '}
          Apresentação
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed italic">
          "
          {perfil?.bio ||
            'Profissional dedicado ao bem-estar e cuidado especializado no Nosso Zelo.'}
          "
        </p>

        <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <FaMapMarkerAlt size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">
              {perfil?.cidade}, {perfil?.estado}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <FaCalendarDay size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">
              Membro desde{' '}
              {new Date(perfil?.criado_em).getFullYear()}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerfilSidebar;
