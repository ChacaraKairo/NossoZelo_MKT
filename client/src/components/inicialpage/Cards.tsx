import React from 'react';
import Style from './styles/Card.module.css';

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
  return (
    <div className={Style.card}>
      <img
        src={imageUrl}
        alt={alt}
        className={Style.image}
        onClick={() =>
          (window.location.href = '/home/nossozelo/' + tipo)
        }
      />
      <div className={Style.text}>{alt}</div>
    </div>
  );
};

export default Card;
