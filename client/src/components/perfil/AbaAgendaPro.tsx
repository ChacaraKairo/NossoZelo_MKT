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
  if (Number.isNaN(data.getTime())) return 'Data inválida';

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
  });
}

function obterObservacao(item: AgendaPerfil) {
  const itemComObservacoes = item as AgendaPerfil & {
    observacoes?: string | null;
  };

  return item.observacao || itemComObservacoes.observacoes;
}

function horarioCompleto(item: AgendaPerfil) {
  const itemComHorario = item as AgendaPerfil & {
    hora_inicio?: string | Date | null;
    hora_fim?: string | Date | null;
  };
  const inicio = formatarHora(itemComHorario.hora_inicio);
  const fim = formatarHora(itemComHorario.hora_fim);

  if (inicio && fim) return `${inicio} - ${fim}`;
  if (inicio) return inicio;
  if (fim) return fim;

  return 'Horário não informado';
}

export default function AbaAgendaPro({
  perfil,
}: AbaAgendaProProps) {
  const agenda = useMemo(() => perfil.agenda || [], [perfil.agenda]);
  const dadosInvalidos = !Array.isArray(agenda);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderização da agenda', {
      perfilId: perfil.dados_usuario?.id || perfil.id,
    });
    logger.info(CONTEXTO, 'Quantidade de itens da agenda', {
      total: Array.isArray(agenda) ? agenda.length : 0,
    });
  }, [perfil, agenda]);

  const handleBloquearHorario = () => {
    logger.info(CONTEXTO, 'Clique em bloquear horário');
  };

  if (dadosInvalidos) {
    logger.error(
      CONTEXTO,
      'Erro de dados inválidos na agenda',
      { agenda },
    );

    return (
      <div className={styles.errorBox}>
        <p>
          Não foi possível exibir a agenda.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>
            Agenda
          </h2>
          <p className={styles.subtitle}>
            Horários recebidos do seu perfil.
          </p>
        </div>
        <button
          type="button"
          disabled
          onClick={handleBloquearHorario}
          title="Bloqueio manual será ativado após integração da agenda."
          className={styles.disabledButton}
        >
          Bloqueio manual será ativado após integração da agenda.
        </button>
      </header>

      {agenda.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum item de agenda encontrado."
          descricao="Quando houver horários ou contratações na sua agenda, eles aparecerão aqui."
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
                  <p className={styles.time}>
                    <FaClock className={styles.timeIcon} />
                    {horarioCompleto(item)}
                  </p>
                  {obterObservacao(item) && (
                    <p className={styles.observation}>
                      {obterObservacao(item)}
                    </p>
                  )}
                </div>

                <span className={styles.badge}>
                  {item.status || 'Status não informado'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
