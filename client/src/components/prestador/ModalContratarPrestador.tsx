import { FormEvent, useEffect, useMemo, useState } from 'react';
import Carregando from '@/components/common/Carregando';
import { contratacaoService } from '@/service/contratacaoService';
import { ServicoPerfil } from '@/types/perfil';
import { getUsuarioDoCookie } from '@/utils/auth';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';

interface ModalContratarPrestadorProps {
  aberto: boolean;
  prestadorId: string;
  tipoPrestador?: string;
  servicos?: ServicoPerfil[];
  onClose: () => void;
}

const CONTEXTO = 'ModalContratarPrestador';

export default function ModalContratarPrestador({
  aberto,
  prestadorId,
  tipoPrestador,
  servicos = [],
  onClose,
}: ModalContratarPrestadorProps) {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    logger.info(CONTEXTO, 'Abertura do modal', { prestadorId });
  }, [aberto, prestadorId]);

  const payload = useMemo(
    () => {
      const usuario = getUsuarioDoCookie();
      const servicoSelecionado = servicos.find(
        (servico) => String(servico.id) === servicoId,
      );
      const [horas, minutos] = hora.split(':');
      const horaFim =
        hora && horas
          ? `${String((Number(horas) + 1) % 24).padStart(2, '0')}:${
              minutos || '00'
            }`
          : undefined;

      return {
        cliente_id: usuario?.id,
        prestador_id: prestadorId,
        tipo_prestador: tipoPrestador,
        servico_id: servicoId ? Number(servicoId) : undefined,
        data,
        hora_inicio: hora || undefined,
        hora_fim: horaFim,
        preco:
          servicoSelecionado?.valor !== undefined
            ? Number(servicoSelecionado.valor)
            : undefined,
        observacoes: observacao,
        observacao,
      };
    },
    [data, hora, observacao, prestadorId, servicoId, servicos, tipoPrestador],
  );

  if (!aberto) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    logger.info(CONTEXTO, 'Dados preenchidos', payload);

    if (!data) {
      setErro('Informe a data desejada.');
      return;
    }

    if (!hora) {
      setErro('Informe o horario desejado.');
      return;
    }

    if (!servicoId) {
      setErro('Selecione um servico para solicitar o agendamento.');
      return;
    }

    if (!confirmado) {
      setErro('Confirme os dados antes de solicitar a contratação.');
      return;
    }

    try {
      setLoading(true);
      logger.info(CONTEXTO, 'Envio de solicitação', payload);
      await contratacaoService.solicitarContratacao(payload);
      logger.info(CONTEXTO, 'Solicitação criada com sucesso');
      setSucesso('Solicitação enviada com sucesso.');
      setTimeout(onClose, 900);
    } catch (error: unknown) {
      const mensagem = extrairMensagemErro(error);
      const mensagemFinal = mensagem.includes('[TODO tecnico]')
        ? 'Fluxo de contratação ainda não está disponível no servidor.'
        : mensagem;
      logger.error(CONTEXTO, 'Erro ao solicitar contratação', {
        mensagem: mensagemFinal,
      });
      setErro(mensagemFinal);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Solicitar contratação
            </h2>
            <p className="text-sm text-slate-500">
              Envie uma solicitação real para o prestador.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold text-slate-500"
          >
            Fechar
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Data desejada
            </span>
            <input
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Horário desejado
            </span>
            <input
              type="time"
              value={hora}
              onChange={(event) => setHora(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Serviço
            </span>
            <select
              value={servicoId}
              onChange={(event) => setServicoId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione um servico</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome || servico.tipo || `Serviço #${servico.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-slate-500">
              Observações
            </span>
            <textarea
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              className="mt-2 min-h-[96px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Descreva a necessidade do atendimento"
            />
          </label>

          <label className="flex items-start gap-3 text-sm font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={confirmado}
              onChange={(event) => setConfirmado(event.target.checked)}
              className="mt-1"
            />
            Confirmo que os dados da solicitação estão corretos.
          </label>

          {erro && (
            <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}
          {sucesso && (
            <p className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm font-semibold text-teal-700">
              {sucesso}
            </p>
          )}

          {loading ? (
            <Carregando mensagem="Enviando solicitação..." />
          ) : (
            <button
              type="submit"
              className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700"
            >
              Confirmar solicitação
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
