import { useMemo, useState } from 'react';
import { assinaturaService } from '@/service/assinaturaService';
import { PerfilUsuario } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

interface AbaFinanceiroProProps {
  perfil: PerfilUsuario;
  onAssinaturaAtualizada?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aguardando_confirmacao: 'Aguardando confirmacao',
  ativa: 'Ativa',
  atrasada: 'Atrasada',
  bloqueada: 'Bloqueada',
  cancelada: 'Cancelada',
  falhou: 'Falhou',
  expirada: 'Expirada',
};

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Nao informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Nao informado';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

export default function AbaFinanceiroPro({
  perfil,
  onAssinaturaAtualizada,
}: AbaFinanceiroProProps) {
  const [planoId, setPlanoId] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const assinatura = perfil.assinatura_atual;
  const status = perfil.assinatura_status || assinatura?.status || 'pendente';
  const aguardandoConfirmacao = status === 'aguardando_confirmacao';
  const dataLimite = useMemo(
    () =>
      perfil.assinatura_confirmacao_expira_em ||
      assinatura?.confirmacao_expira_em ||
      null,
    [assinatura?.confirmacao_expira_em, perfil.assinatura_confirmacao_expira_em],
  );

  const regularizar = async () => {
    try {
      setCarregando(true);
      setErro(null);
      setMensagem(null);
      const resultado =
        await assinaturaService.regularizarAssinaturaMock(planoId);
      setMensagem(
        resultado.gateway_resultado.mensagem ||
          'Solicitacao de assinatura enviada.',
      );
      onAssinaturaAtualizada?.();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Financeiro</h2>
          <p className="mt-2 text-sm text-slate-600">
            Assinatura mensal do perfil profissional.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">
          {STATUS_LABEL[status] || status}
        </span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4">
          <span className="text-xs font-black uppercase text-slate-500">
            Perfil profissional
          </span>
          <p className="mt-1 text-base font-black text-slate-900">
            {perfil.perfil_profissional_ativo ? 'Ativo' : 'Inativo'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <span className="text-xs font-black uppercase text-slate-500">
            Limite de confirmacao
          </span>
          <p className="mt-1 text-base font-black text-slate-900">
            {formatarData(dataLimite)}
          </p>
        </div>
      </div>

      {aguardandoConfirmacao && (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Pagamento iniciado. A confirmacao pode levar ate 72 horas. Durante
          esse periodo, a conta segue acessivel, mas o perfil profissional fica
          inativo para buscas e pedidos.
        </div>
      )}

      {!perfil.perfil_profissional_ativo && !aguardandoConfirmacao && (
        <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Regularize a assinatura para voltar a aparecer nas buscas e receber
          pedidos.
        </div>
      )}

      {erro && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {mensagem}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid gap-1">
          <span className="text-xs font-black uppercase text-slate-500">
            Plano
          </span>
          <input
            className="h-11 w-32 rounded-md border border-slate-300 px-3 font-bold text-slate-900"
            type="number"
            min={1}
            value={planoId}
            onChange={(event) => setPlanoId(Number(event.target.value))}
            disabled={carregando}
          />
        </label>
        <button
          type="button"
          className="h-11 rounded-md bg-slate-900 px-4 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={regularizar}
          disabled={carregando || !Number.isInteger(planoId) || planoId <= 0}
        >
          {carregando ? 'Processando...' : 'Regularizar assinatura'}
        </button>
      </div>
    </section>
  );
}
