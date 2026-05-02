import { FormEvent, useEffect, useState } from 'react';
import { assinaturaService } from '@/service/assinaturaService';
import { ModoModalCartaoAssinatura } from '@/types/assinatura';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/ModalCartaoAssinatura.module.css';

type ModalCartaoAssinaturaProps = {
  aberto: boolean;
  modo: ModoModalCartaoAssinatura;
  planoId: number;
  statusAssinatura: string;
  onFechar: () => void;
  onSucesso: (mensagem: string) => void;
};

export default function ModalCartaoAssinatura({
  aberto,
  planoId,
  statusAssinatura,
  onFechar,
  onSucesso,
}: ModalCartaoAssinaturaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aberto) {
      setErro(null);
      setSucesso(null);
      setLinkPagamento(null);
      setPixCopiaCola(null);
      setLoading(false);
    }
  }, [aberto]);

  if (!aberto) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isInteger(planoId) || planoId <= 0) {
      setErro('Informe um plano valido antes de continuar.');
      setSucesso(null);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      setSucesso(null);
      const resultado = await assinaturaService.regularizarAssinatura(planoId);
      const mensagem =
        resultado.gateway_resultado.mensagem ||
        'Cobranca criada no Asaas. Conclua o pagamento para ativar o perfil.';

      setSucesso(mensagem);
      setLinkPagamento(
        resultado.gateway_resultado.invoiceUrl ||
          resultado.gateway_resultado.bankSlipUrl ||
          null,
      );
      setPixCopiaCola(resultado.gateway_resultado.pixQrCode?.payload || null);
      onSucesso(mensagem);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <section
        className={styles.modal}
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-assinatura-titulo"
      >
        <header className={styles.header}>
          <div>
            <h3 id="modal-assinatura-titulo">Gerar cobranca Asaas</h3>
            <p>
              A cobranca sera criada diretamente no Asaas. O perfil profissional
              so fica ativo depois da confirmacao pelo webhook.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onFechar}
            disabled={loading}
            aria-label="Fechar modal"
          >
            x
          </button>
        </header>

        <div className={styles.securityNote}>
          Status atual: {statusAssinatura}. Nenhum dado de cartao e coletado
          por esta tela.
        </div>

        {erro && <div className={styles.error}>{erro}</div>}
        {sucesso && <div className={styles.success}>{sucesso}</div>}
        {linkPagamento && (
          <a
            className={`${styles.primaryButton} ${styles.paymentLink}`}
            href={linkPagamento}
            target="_blank"
            rel="noreferrer"
          >
            Abrir pagamento
          </a>
        )}
        {pixCopiaCola && (
          <textarea
            className={styles.pixPayload}
            readOnly
            value={pixCopiaCola}
            aria-label="Pix copia e cola"
          />
        )}

        <form className={styles.form} onSubmit={onSubmit}>
          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onFechar}
              disabled={loading}
            >
              Fechar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar cobranca'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
