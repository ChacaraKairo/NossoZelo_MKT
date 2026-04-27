import styles from '@/styles/components/perfil/PerfilHeader.module.css';

interface PerfilHeaderProps {
  nome: string;
  tipo: string;
  urlFoto?: string | null;
  cidade?: string | null;
  estado?: string | null;
  avaliacaoMedia?: number | string | null;
  subtitulo?: string;
}

function texto(valor: unknown, fallback = 'Não informado') {
  if (valor === null || valor === undefined || valor === '') {
    return fallback;
  }

  return String(valor);
}

function inicialNome(nome: string) {
  return nome.trim().charAt(0).toUpperCase() || 'N';
}

function formatarAvaliacao(valor?: number | string | null) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const nota = Number(valor);
  if (Number.isNaN(nota)) return null;

  return nota.toFixed(1);
}

export default function PerfilHeader({
  nome,
  tipo,
  urlFoto,
  cidade,
  estado,
  avaliacaoMedia,
  subtitulo,
}: PerfilHeaderProps) {
  const localizacao =
    cidade || estado
      ? `${texto(cidade)} / ${texto(estado)}`
      : 'Localização não informada';
  const nota = formatarAvaliacao(avaliacaoMedia);

  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        {urlFoto ? (
          <img
            src={urlFoto}
            alt={nome}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {inicialNome(nome)}
          </div>
        )}

        <div className={styles.copy}>
          <h1 className={styles.name}>
            {texto(nome)}
          </h1>
          <p className={styles.type}>
            {texto(tipo)}
          </p>
          {subtitulo && (
            <p className={styles.subtitle}>
              {subtitulo}
            </p>
          )}
          <p className={styles.location}>
            {localizacao}
          </p>
          {nota && (
            <p className={styles.rating}>
              Avaliação média: {nota}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
