import React from 'react';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import styles from '@/styles/components/perfil/HeaderPro.module.css';

interface HeaderProProps {
  perfil: any;
}

const HeaderPro: React.FC<HeaderProProps> = ({
  perfil,
}) => {
  if (!perfil) return null;

  // Pegamos apenas o primeiro e último nome para manter limpo
  const nomes = perfil.nome.split(' ');
  const nomeExibicao =
    nomes.length > 1
      ? `${nomes[0]} ${nomes[nomes.length - 1]}`
      : nomes[0];

  return (
    <div className={styles.card}>
      {/* Container da Foto com Status Online */}
      <div className={styles.avatarWrapper}>
        <img
          src={
            perfil.url_foto_perfil || '/default-avatar.png'
          }
          alt={perfil.nome}
          className={styles.avatarImage}
        />
        <div
          className={styles.onlineStatus}
          title="Online agora"
        />
      </div>

      {/* Nome e Selo de Verificado */}
      <div className={styles.nameRow}>
        <h2 className={styles.userName}>{nomeExibicao}</h2>
        <FaCheckCircle
          className={styles.verifiedIcon}
          title="Perfil Verificado"
        />
      </div>

      {/* Tipo de Profissional */}
      <span className={styles.userType}>{perfil.tipo}</span>

      {/* Box de Avaliação (Estilo Dashboard) */}
      <div className={styles.ratingBox}>
        <FaStar className="text-amber-400 text-xs" />
        <span className={styles.ratingValue}>
          {perfil.avaliacao_media
            ? Number(perfil.avaliacao_media).toFixed(1)
            : '5.0'}
        </span>
        <span className={styles.ratingCount}>
          ({perfil.avaliacoes_recebidas?.length || 0})
        </span>
      </div>
    </div>
  );
};

export default HeaderPro;
