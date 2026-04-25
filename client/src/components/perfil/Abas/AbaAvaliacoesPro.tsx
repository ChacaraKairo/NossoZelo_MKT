import React from 'react';
import {
  FaStar,
  FaRegStar,
  FaUserCircle,
  FaQuoteRight,
} from 'react-icons/fa';
import { PerfilCompleto, Avaliacao } from '../types/types'; // 🔥 Usando a tipagem estrita

interface AbaAvaliacoesProProps {
  perfil: PerfilCompleto;
}

const AbaAvaliacoesPro: React.FC<AbaAvaliacoesProProps> = ({
  perfil,
}) => {
  // Extrai as avaliações com base na relação do Prisma
  const avaliacoes =
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios ||
    [];

  // Função auxiliar para renderizar as 5 estrelas
  const renderEstrelas = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < nota ? (
          <FaStar className="text-amber-400" />
        ) : (
          <FaRegStar className="text-slate-200" />
        )}
      </span>
    ));
  };

  // Fallback (Empty State) se não houver avaliações
  if (avaliacoes.length === 0) {
    return (
      <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <FaStar className="text-slate-200 text-5xl mx-auto mb-4" />
        <p className="text-slate-400 font-bold">
          Você ainda não possui avaliações.
        </p>
        <p className="text-slate-300 text-sm">
          Realize atendimentos para começar a receber
          feedbacks!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Feedbacks de Clientes
          </h3>
          <p className="text-slate-400 text-sm">
            O que as pessoas dizem sobre seu trabalho.
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <span className="text-blue-700 font-black text-lg">
            {perfil.avaliacao_media
              ? Number(perfil.avaliacao_media).toFixed(1)
              : '5.0'}
          </span>
          <div className="flex text-[10px]">
            {renderEstrelas(
              Math.round(
                Number(perfil.avaliacao_media) || 5,
              ),
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {avaliacoes.map((av: Avaliacao) => (
          <div
            key={av.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <FaQuoteRight className="absolute -right-2 -bottom-2 text-slate-50 text-6xl group-hover:text-blue-50 transition-colors" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                {av.usuarios_avaliacoes_cliente_idTousuarios
                  ?.url_foto_perfil ? (
                  <img
                    src={
                      av
                        .usuarios_avaliacoes_cliente_idTousuarios
                        .url_foto_perfil
                    }
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                    alt="Cliente"
                  />
                ) : (
                  <FaUserCircle className="text-slate-200 text-4xl" />
                )}
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {av
                      .usuarios_avaliacoes_cliente_idTousuarios
                      ?.nome || 'Cliente Nosso Zelo'}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    {new Date(
                      av.data_avaliacao,
                    ).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 text-xs">
                {renderEstrelas(av.nota)}
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed italic relative z-10">
              "
              {av.comentario ||
                'O cliente não deixou um comentário por escrito, apenas a nota.'}
              "
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbaAvaliacoesPro;
