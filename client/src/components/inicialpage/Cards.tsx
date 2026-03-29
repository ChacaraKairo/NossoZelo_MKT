import React from 'react';
import Style from './styles/Card.module.css';
import { useRouter } from 'next/router';

interface CardProps {
  imageUrl: string;
  alt: string;
  tipo: string;
}

const Card: React.FC<CardProps> = ({
  imageUrl,
  alt,
  tipo,
}) => {
  const router = useRouter();

  return (
    <div
      className={Style.card}
      onClick={() =>
        router.push(
          `/prestadores?tipo=${tipo.toLowerCase()}`,
        )
      }
    >
      <img
        src={imageUrl}
        alt={alt}
        className={Style.image}
      />
      <div className={Style.text}>{alt}</div>
    </div>
  );
};

export default Card;
