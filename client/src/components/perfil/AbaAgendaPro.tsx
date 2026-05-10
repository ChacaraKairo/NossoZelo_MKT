import { useEffect, useMemo } from 'react';
import { FaClock } from 'react-icons/fa';
import EstadoVazio from '@/components/common/EstadoVazio';
import { AgendaPerfil, PerfilUsuario } from '@/types/perfil';
import logger from '@/utils/logger';
import styles from '@/styles/components/perfil/AbaAgendaPro.module.css';

interface AbaAgendaProProps {
  perfil: PerfilUsuario;
}

const CONTEXTO = 'AbaAgendaPro';

function formatarData(valor: string | Date) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data invalida';

  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatarHora(valor?: string | Date | null) {
  if (!valor) return null;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);

  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function formatarValor(valor?: number | string | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function obterObservacao(item: AgendaPerfil) {
  return item.observacao || item.observacoes;
}

function horarioCompleto(item: AgendaPerfil) {
  const inicio = formatarHora(item.hora_inicio);
  const fim = formatarHora(item.hora_fim);

  if (inicio && fim) return `${inicio} - ${fim}`;
  if (inicio) return inicio;
  if (fim) return fim;

  return 'Horario a combinar';
}

export default function AbaAgendaPro({
  perfil,
}: AbaAgendaProProps) {
  const agenda = useMemo(() => perfil.agenda || [], [perfil.agenda]);
  const dadosInvalidos = !Array.isArray(agenda);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderizacao da agenda', {
      perfilId: perfil.dados_usuario?.id || perfil.id,
    });
    logger.info(CONTEXTO, 'Quantidade de itens da agenda', {
      total: Array.isArray(agenda) ? agenda.length : 0,
    });
  }, [perfil, agenda]);

  const handleBloquearHorario = () => {
    logger.info(CONTEXTO, 'Clique em bloquear horario');
  };

  if (dadosInvalidos) {
    logger.error(
      CONTEXTO,
      'Erro de dados invalidos na agenda',
      { agenda },
    );

    return (
      <div className={styles.errorBox}>
        <p>Nao foi possivel exibir a agenda.</p>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Agenda</h2>
          <p className={styles.subtitle}>
            Proximos atendimentos marcados a partir de hoje.
          </p>
        </div>
        <button
          type="button"
          disabled
          onClick={handleBloquearHorario}
          title="Em breve voce podera reservar horarios por aqui."
          className={styles.disabledButton}
        >
          Reservar horario em breve
        </button>
      </header>

      {agenda.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum item de agenda encontrado."
          descricao="Quando houver pedidos ou atendimentos futuros, eles aparecerao aqui."
        />
      ) : (
        <div className={styles.list}>
          {agenda.map((item) => (
            <article
              key={item.id}
              className={styles.card}
            >
              <div className={styles.cardBody}>
                <div>
                  <p className={styles.date}>
                    {formatarData(item.data)}
                  </p>
                  {item.cliente?.nome && (
                    <p className={styles.client}>
                      Cliente: {item.cliente.nome}
                    </p>
                  )}
                  <p className={styles.time}>
                    <FaClock className={styles.timeIcon} />
                    {horarioCompleto(item)}
                  </p>
                  {formatarValor(item.preco) && (
                    <p className={styles.price}>
                      Valor: {formatarValor(item.preco)}
                    </p>
                  )}
                  {obterObservacao(item) && (
                    <p className={styles.observation}>
                      {obterObservacao(item)}
                    </p>
                  )}
                </div>

                <span className={styles.badge}>
                  {item.status || 'A combinar'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
