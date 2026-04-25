import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ServicoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';

interface PrestadorCardLike {
  id: string;
  nome: string;
  tipo?: string | null;
  cidade?: string | null;
  estado?: string | null;
  url_foto_perfil?: string | null;
  avaliacao_media?: number | string | null;
  rating?: number | string | null;
  servicos?: ServicoPerfil[];
  foto?: string | null;
  imageUrl?: string | null;
  localidade?: string | null;
  avaliacao?: number | string | null;
  precoHora?: number | string | null;
}

interface CardPrestadorProps {
  prestador: PrestadorCardLike;
}

const CONTEXTO = 'CardPrestador';

function texto(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }
  return String(valor);
}

function obterPreco(servicos?: ServicoPerfil[]) {
  const servicoComValor = servicos?.find((servico) => servico.valor);
  return servicoComValor?.valor ? `A partir de ${servicoComValor.valor}` : null;
}

export default function CardPrestador({ prestador }: CardPrestadorProps) {
  const router = useRouter();
  const href = `/prestador/${prestador.id}`;
  const foto = prestador.url_foto_perfil || prestador.foto || prestador.imageUrl;
  const preco =
    obterPreco(prestador.servicos) ||
    (prestador.precoHora ? `A partir de ${prestador.precoHora}` : null);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderização do card', {
      prestadorId: prestador.id,
    });
  }, [prestador.id]);

  const navegar = () => {
    logger.info(CONTEXTO, 'Clique no card', { prestadorId: prestador.id });
    logger.info(CONTEXTO, 'Navegação para vitrine', { href });
    router.push(href);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={navegar}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') navegar();
      }}
      className="cursor-pointer rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-4">
        {foto ? (
          <img
            src={foto}
            alt={prestador.nome}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-xl font-black text-teal-700">
            {prestador.nome?.charAt(0)?.toUpperCase() || 'P'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-black text-slate-800">
            {texto(prestador.nome)}
          </h3>
          <p className="text-sm font-semibold capitalize text-slate-500">
            {texto(prestador.tipo)}
          </p>
          <p className="text-sm text-slate-400">
            {prestador.localidade ||
            prestador.cidade ||
            prestador.estado
              ? prestador.localidade ||
                `${prestador.cidade ?? ''}${prestador.cidade && prestador.estado ? ' / ' : ''}${prestador.estado ?? ''}`
              : 'Localização não informada'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          Nota{' '}
          {prestador.rating ??
            prestador.avaliacao_media ??
            prestador.avaliacao ??
            'não informada'}
        </span>
        {preco && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
            {preco}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          navegar();
        }}
        className="mt-4 w-full rounded-lg border border-teal-100 px-4 py-2 text-sm font-bold text-teal-700"
      >
        Ver perfil
      </button>
    </article>
  );
}
