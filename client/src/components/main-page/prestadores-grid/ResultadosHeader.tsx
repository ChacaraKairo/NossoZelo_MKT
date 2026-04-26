import styles from '@/styles/components/main-page/prestadores-grid/PrestadoresGrid.module.css';

interface ResultadosHeaderProps {
  total: number;
  categoria?: string;
  localizacao?: string;
  distancia?: number;
  precoMax?: string;
}

function montarFiltros({
  categoria,
  localizacao,
  distancia,
  precoMax,
}: Omit<ResultadosHeaderProps, 'total'>) {
  const filtros = [];
  if (categoria) filtros.push(categoria);
  if (localizacao) filtros.push(localizacao);
  if (distancia) filtros.push(`até ${distancia}km`);
  if (precoMax) filtros.push(`preço até R$ ${precoMax}`);
  return filtros;
}

export default function ResultadosHeader(props: ResultadosHeaderProps) {
  const filtros = montarFiltros(props);
  const titulo =
    props.total > 0
      ? `${props.total} prestador${props.total === 1 ? '' : 'es'} encontrado${
          props.total === 1 ? '' : 's'
        }`
      : 'Prestadores disponíveis';

  return (
    <header>
      <h2 className={styles.headerTitle}>{titulo}</h2>
      <p className={styles.headerSubtitle}>
        {filtros.length > 0 ? filtros.join(' • ') : 'Sem filtros aplicados'}
      </p>
    </header>
  );
}
