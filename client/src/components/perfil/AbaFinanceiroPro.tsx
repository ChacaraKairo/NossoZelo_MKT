import { useMemo, useState } from 'react';
import ModalCartaoAssinatura from '@/components/perfil/ModalCartaoAssinatura';
import { assinaturaService } from '@/service/assinaturaService';
import { PerfilUsuario } from '@/types/perfil';
import { ModoModalCartaoAssinatura } from '@/types/assinatura';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/AbaFinanceiroPro.module.css';

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

function classeStatus(status: string) {
  if (status === 'ativa') return styles.statusActive;
  if (status === 'aguardando_confirmacao' || status === 'pendente') {
    return styles.statusWarning;
  }
  if (
    status === 'falhou' ||
    status === 'expirada' ||
    status === 'bloqueada' ||
    status === 'cancelada'
  ) {
    return styles.statusDanger;
  }

  return '';
}

export default function AbaFinanceiroPro({
  perfil,
  onAssinaturaAtualizada,
}: AbaFinanceiroProProps) {
  const [planoId, setPlanoId] = useState(
    perfil.assinatura_atual?.plano_id || 1,
  );
  const [carregandoAcao, setCarregandoAcao] = useState<
    'cancelar' | null
  >(null);
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [modoModalCartao, setModoModalCartao] =
    useState<ModoModalCartaoAssinatura>('regularizar');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const assinatura = perfil.assinatura_atual;
  const status = perfil.assinatura_status || assinatura?.status || 'pendente';
  const aguardandoConfirmacao = status === 'aguardando_confirmacao';
  const assinaturaAtiva = status === 'ativa';
  const assinaturaCancelavel = Boolean(
    assinatura && !['cancelada', 'expirada'].includes(status),
  );
  const dataLimite = useMemo(
    () =>
      perfil.assinatura_confirmacao_expira_em ||
      assinatura?.confirmacao_expira_em ||
      null,
    [assinatura?.confirmacao_expira_em, perfil.assinatura_confirmacao_expira_em],
  );

  const abrirModalCartao = (modo: ModoModalCartaoAssinatura) => {
    setErro(null);
    setMensagem(null);
    setModoModalCartao(modo);
    setModalCartaoAberto(true);
  };

  const fecharModalCartao = () => {
    setModalCartaoAberto(false);
  };

  const sucessoModalCartao = (mensagemSucesso: string) => {
    setMensagem(mensagemSucesso);
    setModalCartaoAberto(false);
    onAssinaturaAtualizada?.();
  };

  const cancelar = async () => {
    const confirmou = window.confirm(
      'Cancelar sua assinatura? Seu perfil profissional ficará inativo para buscas e pedidos.',
    );
    if (!confirmou) return;

    try {
      setCarregandoAcao('cancelar');
      setErro(null);
      setMensagem(null);
      const resultado = await assinaturaService.cancelarAssinaturaMock();
      setMensagem(resultado.message || 'Assinatura cancelada.');
      onAssinaturaAtualizada?.();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregandoAcao(null);
    }
  };

  const carregando = carregandoAcao !== null;
  const acaoPrincipal: {
    label: string;
    modo: ModoModalCartaoAssinatura;
  } = assinaturaAtiva
    ? { label: 'Trocar cartao', modo: 'trocar_cartao' }
    : { label: 'Regularizar assinatura', modo: 'regularizar' };

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
          <span className={styles.label}>Limite de confirmacao</span>
          <p className={styles.value}>{formatarData(dataLimite)}</p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Proximo vencimento</span>
          <p className={styles.value}>
            {formatarData(assinatura?.data_proximo_vencimento)}
          </p>
        </article>
        <article className={styles.card}>
          <span className={styles.label}>Gateway</span>
          <p className={styles.value}>{assinatura?.gateway || 'mock'}</p>
        </article>
      </div>

      {aguardandoConfirmacao && (
        <div className={styles.notice}>
          Pagamento em analise. A confirmacao pode levar ate 72 horas. Enquanto
          isso, seu perfil nao aparece nas buscas e voce nao recebe pedidos.
        </div>
      )}

      {assinaturaAtiva && (
        <div className={styles.success}>
          Sua assinatura esta ativa. Perfil profissional liberado para buscas e
          pedidos.
        </div>
      )}

      {!perfil.perfil_profissional_ativo && !aguardandoConfirmacao && (
        <div className={styles.notice}>
          Regularize a assinatura para voltar a aparecer nas buscas e receber
          pedidos.
        </div>
      )}

      {erro && <div className={styles.error}>{erro}</div>}
      {mensagem && <div className={styles.success}>{mensagem}</div>}

      <div className={styles.form}>
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span className={styles.label}>Plano</span>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={planoId}
              onChange={(event) => setPlanoId(Number(event.target.value))}
              disabled={carregando}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => abrirModalCartao(acaoPrincipal.modo)}
              disabled={
                carregando || !Number.isInteger(planoId) || planoId <= 0
              }
            >
              {acaoPrincipal.label}
            </button>
            {aguardandoConfirmacao && (
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => abrirModalCartao('regularizar')}
                disabled={
                  carregando || !Number.isInteger(planoId) || planoId <= 0
                }
              >
                Tentar novamente com outro cartao
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
      </div>
      <ModalCartaoAssinatura
        aberto={modalCartaoAberto}
        modo={modoModalCartao}
        planoId={planoId}
        statusAssinatura={status}
        onFechar={fecharModalCartao}
        onSucesso={sucessoModalCartao}
      />
    </section>
  );
}
