import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ServicoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';
import styles from '@/styles/components/prestador/CardPrestador.module.css';

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
      className={styles.card}
    >
      <div className={styles.mainRow}>
        {foto ? (
          <img
            src={foto}
            alt={prestador.nome}
            className={styles.photo}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {prestador.nome?.charAt(0)?.toUpperCase() || 'P'}
          </div>
        )}
        <div className={styles.info}>
          <h3 className={styles.name}>
            {texto(prestador.nome)}
          </h3>
          <p className={styles.type}>
            {texto(prestador.tipo)}
          </p>
          <p className={styles.location}>
            {prestador.localidade ||
            prestador.cidade ||
            prestador.estado
              ? prestador.localidade ||
                `${prestador.cidade ?? ''}${prestador.cidade && prestador.estado ? ' / ' : ''}${prestador.estado ?? ''}`
              : 'Localização não informada'}
          </p>
        </div>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.badge}>
          Nota{' '}
          {prestador.rating ??
            prestador.avaliacao_media ??
            prestador.avaliacao ??
            'não informada'}
        </span>
        {preco && (
          <span className={styles.priceBadge}>
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
        className={styles.button}
      >
        Ver perfil
      </button>
    </article>
  );
}
