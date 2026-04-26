import React from 'react';
import styles from '@/styles/components/common/Common.module.css';

interface CarregandoProps {
  mensagem?: string;
}

export default function Carregando({
  mensagem = 'Carregando...',
}: CarregandoProps) {
  return (
    <div className={styles.loading}>
      <span
        aria-hidden="true"
        className={styles.spinner}
      />
      <span>{mensagem}</span>
    </div>
  );
}
