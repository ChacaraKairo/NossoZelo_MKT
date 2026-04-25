import { useEffect, useMemo } from 'react';
import { FaClock } from 'react-icons/fa';
import EstadoVazio from '@/components/common/EstadoVazio';
import { AgendaPerfil, PerfilUsuario } from '@/types/perfil';
import logger from '@/utils/logger';

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
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
        <p className="font-bold text-red-700">
          Não foi possível exibir a agenda.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">
            Agenda
          </h2>
          <p className="text-sm text-slate-500">
            Horários recebidos do seu perfil.
          </p>
        </div>
        <button
          type="button"
          disabled
          onClick={handleBloquearHorario}
          title="Bloqueio manual será ativado após integração da agenda."
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="space-y-3">
          {agenda.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-bold capitalize text-slate-800">
                    {formatarData(item.data)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <FaClock className="text-slate-300" />
                    {horarioCompleto(item)}
                  </p>
                  {obterObservacao(item) && (
                    <p className="mt-2 text-sm text-slate-500">
                      {obterObservacao(item)}
                    </p>
                  )}
                </div>

                <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
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
