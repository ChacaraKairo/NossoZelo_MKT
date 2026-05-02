import { useEffect, useMemo, useState } from 'react';
import ModalPagamentoAssinatura from '@/components/perfil/ModalPagamentoAssinatura';
import { assinaturaService } from '@/service/assinaturaService';
import { PerfilUsuario } from '@/types/perfil';
import {
  ModoModalPagamentoAssinatura,
  PlanoAssinatura,
} from '@/types/assinatura';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/AbaFinanceiroPro.module.css';

interface AbaFinanceiroProProps {
  perfil: PerfilUsuario;
  onAssinaturaAtualizada?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aguardando_confirmacao: 'Pagamento em anÃ¡lise',
  ativa: 'Ativa',
  atrasada: 'Atrasada',
  bloqueada: 'Bloqueada',
  cancelada: 'Cancelada',
  falhou: 'Falhou',
  expirada: 'Expirada',
};

const STATUS_REGULARIZAVEL = new Set([
  'pendente',
  'falhou',
  'expirada',
  'bloqueada',
  'cancelada',
  'atrasada',
]);

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'NÃ£o informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'NÃ£o informado';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
}

function formatarValor(valor?: number | string | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'Valor nÃ£o informado';

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function classeStatus(status: string) {
  if (status === 'ativa') return styles.statusActive;
  if (status === 'aguardando_confirmacao' || status === 'pendente') {
    return styles.statusWarning;
  }
  if (
    status === 'falhou' ||
    status === 'expirada' ||
    status === 'bloqueada' ||
    status === 'cancelada' ||
    status === 'atrasada'
  ) {
    return styles.statusDanger;
  }

  return '';
}

export default function AbaFinanceiroPro({
  perfil,
  onAssinaturaAtualizada,
}: AbaFinanceiroProProps) {
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<number | null>(
    perfil.assinatura_atual?.plano_id || null,
  );
  const [carregandoPlanos, setCarregandoPlanos] = useState(false);
  const [carregandoAcao, setCarregandoAcao] = useState<
    'cancelar' | null
  >(null);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modoModalPagamento, setModoModalPagamento] =
    useState<ModoModalPagamentoAssinatura>('regularizar');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const assinatura = perfil.assinatura_atual;
  const status = perfil.assinatura_status || assinatura?.status || 'pendente';
  const aguardandoConfirmacao = status === 'aguardando_confirmacao';
  const assinaturaAtiva = status === 'ativa';
  const assinaturaRegularizavel = STATUS_REGULARIZAVEL.has(status);
  const assinaturaCancelavel = Boolean(
    assinatura && !['cancelada', 'expirada'].includes(status),
  );
  const dataLimite = useMemo(
    () =>
      perfil.assinatura_confirmacao_expira_em ||
      assinatura?.confirmacao_expira_em ||
      null,
    [
      assinatura?.confirmacao_expira_em,
      perfil.assinatura_confirmacao_expira_em,
    ],
  );

  useEffect(() => {
    let ativo = true;

    setCarregandoPlanos(true);
    assinaturaService
      .listarPlanos()
      .then((lista) => {
        if (!ativo) return;
        setPlanos(lista);
        setPlanoSelecionado((atual) => atual || lista[0]?.id || null);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(extrairMensagemErro(error));
      })
      .finally(() => {
        if (ativo) setCarregandoPlanos(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const abrirModalPagamento = (modo: ModoModalPagamentoAssinatura) => {
    setErro(null);
    setMensagem(null);
    setModoModalPagamento(modo);
    setModalPagamentoAberto(true);
  };

  const fecharModalPagamento = () => {
    setModalPagamentoAberto(false);
  };

  const sucessoModalPagamento = (mensagemSucesso: string) => {
    setMensagem(mensagemSucesso);
    onAssinaturaAtualizada?.();
  };

  const cancelar = async () => {
    const confirmou = window.confirm(
      'Cancelar sua assinatura? Seu perfil profissional ficarÃ¡ inativo para buscas e pedidos.',
    );
    if (!confirmou) return;

    try {
      setCarregandoAcao('cancelar');
      setErro(null);
      setMensagem(null);
      const resultado = await assinaturaService.cancelarAssinatura();
      setMensagem(resultado.message || 'Assinatura cancelada.');
      onAssinaturaAtualizada?.();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregandoAcao(null);
    }
  };

  const carregando = carregandoAcao !== null || carregandoPlanos;
  const planoInvalido = !planoSelecionado;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Financeiro</h2>
          <p className={styles.subtitle}>
            Gerencie a assinatura mensal que libera seu perfil profissional nas
            buscas e nos pedidos.
          </p>
        </div>
        <span className={`${styles.statusBadge} ${classeStatus(status)}`}>
          {STATUS_LABEL[status] || status}
        </span>
      </header>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.label}>Perfil profissional</span>
          <p className={styles.value}>
            {perfil.perfil_profissional_ativo ? 'Ativo' : 'Inativo'}
          </p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Limite de confirmaÃ§Ã£o</span>
          <p className={styles.value}>{formatarData(dataLimite)}</p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>PrÃ³ximo vencimento</span>
          <p className={styles.value}>
            {formatarData(assinatura?.data_proximo_vencimento)}
          </p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Gateway</span>
          <p className={styles.value}>{assinatura?.gateway || 'asaas'}</p>
        </article>
      </div>

      {aguardandoConfirmacao && (
        <div className={styles.notice}>
          Pagamento em anÃ¡lise. A confirmaÃ§Ã£o pode levar atÃ© 72 horas. Enquanto
          isso, seu perfil nÃ£o aparece nas buscas e vocÃª nÃ£o recebe pedidos.
        </div>
      )}

      {assinaturaAtiva && (
        <div className={styles.success}>
          Sua assinatura estÃ¡ ativa. Perfil profissional liberado para buscas e
          pedidos.
        </div>
      )}

      {!perfil.perfil_profissional_ativo && (
        <div className={styles.notice}>
          Prestador inativo nÃ£o aparece nas buscas e nÃ£o recebe pedidos.
        </div>
      )}

      {erro && <div className={styles.error}>{erro}</div>}
      {mensagem && <div className={styles.success}>{mensagem}</div>}

      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Plano</span>
          <select
            className={styles.input}
            value={planoSelecionado || ''}
            onChange={(event) =>
              setPlanoSelecionado(Number(event.target.value) || null)
            }
            disabled={carregando}
          >
            {!planos.length && <option value="">Nenhum plano disponÃ­vel</option>}
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome} - {formatarValor(plano.valor)}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.planGrid}>
          {planos.map((plano) => (
            <button
              key={plano.id}
              type="button"
              className={`${styles.planCard} ${
                planoSelecionado === plano.id ? styles.planCardActive : ''
              }`}
              onClick={() => setPlanoSelecionado(plano.id)}
              disabled={carregando}
            >
              <strong>{plano.nome}</strong>
              <span>{formatarValor(plano.valor)} / mÃªs</span>
              {plano.beneficios && <small>{plano.beneficios}</small>}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {assinaturaAtiva && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => abrirModalPagamento('gerenciar')}
              disabled={carregando || planoInvalido}
            >
              Gerenciar pagamento
            </button>
          )}

          {assinaturaRegularizavel && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                abrirModalPagamento(assinatura ? 'regularizar' : 'iniciar')
              }
              disabled={carregando || planoInvalido}
            >
              Regularizar assinatura
            </button>
          )}

          {aguardandoConfirmacao && (
            <button
              type="button"
              className={styles.ghostButton}
              onClick={() => abrirModalPagamento('regularizar')}
              disabled={carregando || planoInvalido}
            >
              Abrir/gerar nova cobranÃ§a
            </button>
          )}

          <button
            type="button"
            className={styles.dangerButton}
            onClick={cancelar}
            disabled={carregando || !assinaturaCancelavel}
          >
            {carregandoAcao === 'cancelar'
              ? 'Cancelando...'
              : 'Cancelar assinatura'}
          </button>
        </div>
      </div>

      <ModalPagamentoAssinatura
        aberto={modalPagamentoAberto}
        modo={modoModalPagamento}
        planoId={planoSelecionado}
        statusAssinatura={status}
        onFechar={fecharModalPagamento}
        onSucesso={sucessoModalPagamento}
      />
    </section>
  );
}

