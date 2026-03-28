// file: /components/cards/UserCard.tsx
import React from 'react';
import Button from '@/components/btn/Button';
import { FaPlusCircle } from 'react-icons/fa';
import styles from './styles/UserCard.module.css';

// A interface foi movida para cá para manter o componente auto-contido
interface DadosSimples {
  nome: string;
  tipo: string;
  localidade: string;
  imageUrl: string; // Adicionada para a imagem do perfil
}

interface UserCardProps {
  user: DadosSimples;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return (
    <div className={styles.cardContainer}>
      <img
        src={user.imageUrl}
        alt={user.nome}
        className={styles.profileImage}
      />
      <div className={styles.plusIconWrapper}>
        <FaPlusCircle />
      </div>

      <div className={styles.infoOverlay}>
        <div className={styles.textWrapper}>
          <h3 className={styles.userName}>{user.nome}</h3>
          <p className={styles.userInfo}>{user.tipo}</p>
          <p className={styles.userInfo}>
            {user.localidade}
          </p>
        </div>
        <Button
          variant="secondary" // Usando a variante secundária para o estilo de contorno
          onClick={() =>
            console.log('Contratar ' + user.nome)
          }
        >
          Contratar
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
