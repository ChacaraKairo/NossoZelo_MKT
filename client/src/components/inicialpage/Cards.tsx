import React, { KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Style from '@/styles/components/inicialpage/Card.module.css';
import { CategoriaCard } from './scripts/ImagesCard';
import logger from '@/utils/logger';

interface CardProps {
  item: CategoriaCard;
}

const FALLBACK_IMAGE = '/logos/OnlyLogo.png';
const CONTEXTO = 'CategoriaCard';

const Card: React.FC<CardProps> = ({ item }) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(item.imageUrl);

  const navegar = () => {
    logger.info(CONTEXTO, 'Clique em categoria', {
      tipo: item.tipo,
    });
    router.push(`/prestadores?tipo=${item.tipo}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navegar();
    }
  };

  return (
    <article
      className={Style.card}
      role="button"
      tabIndex={0}
      onClick={navegar}
      onKeyDown={handleKeyDown}
      aria-label={item.cta}
    >
      <div className={Style.imageWrapper}>
        <img
          src={imageSrc}
          alt={item.alt}
          className={Style.image}
          onError={() => {
            logger.warn(CONTEXTO, 'Imagem de categoria falhou', {
              tipo: item.tipo,
              imageUrl: item.imageUrl,
            });
            setImageSrc(FALLBACK_IMAGE);
          }}
        />
      </div>
      <div className={Style.content}>
        <h3>{item.titulo}</h3>
        <p>{item.descricao}</p>
        <span>{item.cta}</span>
      </div>
    </article>
  );
};

export default Card;
