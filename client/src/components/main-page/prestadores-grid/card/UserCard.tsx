import React, { KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { PrestadorCardData } from '@/types/prestador';
import logger from '@/utils/logger';
import styles from './styles/UserCard.module.css';

interface UserCardProps {
  user: PrestadorCardData;
}

const CONTEXTO = 'UserCard';
const FALLBACK_IMAGE = '/logos/OnlyLogo.png';

function formatarPreco(valor?: number) {
  if (valor === undefined) return null;
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(user.imageUrl || FALLBACK_IMAGE);
  const hrefPerfil = `/prestador/${user.id}`;
  const hrefContratacao = `/prestador/${user.id}?acao=contratar`;

  useEffect(() => {
    logger.debug(CONTEXTO, 'Card renderizado', {
      id: user.id,
      tipo: user.tipo,
    });
  }, [user.id, user.tipo]);

  const navegarParaPerfil = () => {
    logger.info(CONTEXTO, 'Clique em ver perfil', {
      prestadorId: user.id,
    });
    router.push(hrefPerfil);
  };

  const navegarParaContratacao = () => {
    logger.info(CONTEXTO, 'Clique para solicitar contratacao', {
      prestadorId: user.id,
    });
    router.push(hrefContratacao);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navegarParaContratacao();
    }
  };

  const handleContratar = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    logger.info(CONTEXTO, 'Clique em contratar', {
      prestadorId: user.id,
      origem: 'card',
    });

    router.push(hrefContratacao);
  };

  const preco = formatarPreco(user.precoHora);

  return (
    <article
      className={styles.cardContainer}
      role="button"
      tabIndex={0}
      onClick={navegarParaContratacao}
      onKeyDown={handleKeyDown}
      aria-label={`Solicitar contratacao de ${user.nome}`}
    >
      <div className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt={`Foto de ${user.nome}`}
          className={styles.profileImage}
          onError={() => {
            logger.warn(CONTEXTO, 'Imagem do prestador falhou', {
              prestadorId: user.id,
              imageUrl: user.imageUrl,
            });
            setImageSrc(FALLBACK_IMAGE);
          }}
        />
        {user.verificado && (
          <span className={styles.verifiedBadge}>
            <FaCheckCircle aria-hidden="true" />
            Verificado
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.titleBlock}>
            <h3 className={styles.userName}>{user.nome}</h3>
            <p className={styles.userType}>{user.tipo}</p>
          </div>
          {user.avaliacao !== undefined && (
            <span className={styles.rating} aria-label={`Nota ${user.avaliacao}`}>
              <FaStar aria-hidden="true" />
              {user.avaliacao.toFixed(1)}
            </span>
          )}
        </div>

        <p className={styles.location}>
          <FaMapMarkerAlt aria-hidden="true" />
          {user.localidade}
        </p>

        <div className={styles.metaRow}>
          {preco && <span className={styles.price}>{preco}/h</span>}
          {user.disponibilidade && (
            <span className={styles.availability}>
              {typeof user.disponibilidade === 'boolean'
                ? 'Disponível'
                : user.disponibilidade}
            </span>
          )}
        </div>

        {user.especialidades && (
          <p className={styles.specialties}>
            {Array.isArray(user.especialidades)
              ? user.especialidades.join(', ')
              : user.especialidades}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={(event) => {
              event.stopPropagation();
              navegarParaPerfil();
            }}
            aria-label={`Ver perfil de ${user.nome}`}
          >
            Ver perfil
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleContratar}
            aria-label={`Contratar ${user.nome}`}
          >
            Contratar
          </button>
        </div>
      </div>
    </article>
  );
};

export default UserCard;
