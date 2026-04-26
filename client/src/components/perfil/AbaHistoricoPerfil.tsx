import EstadoVazio from '@/components/common/EstadoVazio';
import { ContratacaoPerfil } from '@/types/perfil';
import styles from './styles/PerfilOperacional.module.css';

interface AbaHistoricoPerfilProps {
  contratacoes: ContratacaoPerfil[];
  modo: 'cliente' | 'prestador';
}

function texto(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }
  return String(valor);
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Não informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);
  return data.toLocaleDateString('pt-BR');
}

function nomeRelacionado(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
) {
  if (modo === 'cliente') {
    return (
      contratacao.usuarios_contratacoes_prestador_idTousuarios?.nome ||
      'Prestador não informado'
    );
  }

  return (
    contratacao.usuarios_contratacoes_cliente_idTousuarios?.nome ||
    'Cliente não informado'
  );
}

function servico(contratacao: ContratacaoPerfil) {
  return (
    contratacao.servico?.nome ||
    contratacao.servicos?.nome ||
    (contratacao.servico_id
      ? `Serviço #${contratacao.servico_id}`
      : 'Serviço não informado')
  );
}

export default function AbaHistoricoPerfil({
  contratacoes,
  modo,
}: AbaHistoricoPerfilProps) {
  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Histórico vazio."
        descricao={
          modo === 'cliente'
            ? 'Quando você solicitar atendimentos, eles aparecerão aqui.'
            : 'Quando clientes solicitarem ou concluírem atendimentos, eles aparecerão aqui.'
        }
      />
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Histórico</h2>
          <p className={styles.subtitle}>
            Serviços passados, ativos e solicitações em andamento.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {contratacoes.map((contratacao) => (
          <article key={contratacao.id} className={styles.card}>
            <h3 className={styles.cardTitle}>
              {nomeRelacionado(contratacao, modo)}
            </h3>
            <p className={styles.muted}>{servico(contratacao)}</p>
            <div className={styles.meta}>
              <span className={styles.badge}>
                {texto(contratacao.status)}
              </span>
              <span className={styles.badge}>
                {formatarData(contratacao.data)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
