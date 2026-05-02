import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { assinaturaService } from '@/service/assinaturaService';
import {
  ModoModalPagamentoAssinatura,
  RespostaAssinatura,
} from '@/types/assinatura';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/ModalPagamentoAssinatura.module.css';

type ModalPagamentoAssinaturaProps = {
  aberto: boolean;
  modo: ModoModalPagamentoAssinatura;
  planoId: number | null;
  statusAssinatura: string;
  onFechar: () => void;
  onSucesso: (mensagem: string, resultado?: RespostaAssinatura) => void;
};

function rotuloAcao(modo: ModoModalPagamentoAssinatura) {
  if (modo === 'gerenciar') return 'Gerenciar pagamento';
  if (modo === 'iniciar') return 'Gerar cobrança';
  return 'Regularizar assinatura';
}

export default function ModalPagamentoAssinatura({
  aberto,
  modo,
  planoId,
  statusAssinatura,
  onFechar,
  onSucesso,
}: ModalPagamentoAssinaturaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [pixImagem, setPixImagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aberto) {
      setErro(null);
      setSucesso(null);
      setLinkPagamento(null);
      setPixCopiaCola(null);
      setPixImagem(null);
      setLoading(false);
    }
  }, [aberto]);

  if (!aberto) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (modo === 'gerenciar') {
      return;
    }

    if (!Number.isInteger(planoId) || !planoId || planoId <= 0) {
      setErro('Selecione um plano antes de continuar.');
      setSucesso(null);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      setSucesso(null);
      const resultado =
        modo === 'iniciar'
          ? await assinaturaService.iniciarAssinatura(planoId)
          : await assinaturaService.regularizarAssinatura(planoId);
      const gateway = resultado.gateway_resultado;
      const mensagem =
        gateway.mensagem ||
        'Cobrança criada no Asaas. Conclua o pagamento para ativar o perfil.';

      setSucesso(mensagem);
      setLinkPagamento(gateway.invoiceUrl || gateway.bankSlipUrl || null);
      setPixCopiaCola(gateway.pixQrCode?.payload || null);
      setPixImagem(gateway.pixQrCode?.encodedImage || null);
      onSucesso(mensagem, resultado);
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
            <h3 id="modal-assinatura-titulo">{rotuloAcao(modo)}</h3>
            <p>
              A cobrança será gerada no Asaas. Após o pagamento, a confirmação
              será recebida automaticamente pelo sistema.
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
          Status atual: {statusAssinatura}. Nenhum número de cartão ou CVV é
          coletado pelo NossoZelo nesta etapa.
        </div>

        {modo === 'gerenciar' && (
          <div className={styles.securityNote}>
            Nesta etapa ainda não existe troca de cartão dentro do NossoZelo. O
            pagamento deve ser acompanhado pelo ambiente do Asaas e novas
            cobranças só são geradas quando a assinatura precisa ser
            regularizada.
          </div>
        )}

        {erro && <div className={styles.error}>{erro}</div>}
        {sucesso && <div className={styles.success}>{sucesso}</div>}
        {linkPagamento && (
          <a
            className={`${styles.primaryButton} ${styles.paymentLink}`}
            href={linkPagamento}
            target="_blank"
            rel="noreferrer"
          >
            Abrir pagamento no Asaas
          </a>
        )}
        {pixImagem && (
          <Image
            className={styles.pixQrImage}
            src={`data:image/png;base64,${pixImagem}`}
            alt="QR Code Pix da assinatura"
            width={180}
            height={180}
            unoptimized
          />
        )}
        {pixCopiaCola && (
          <label className={styles.pixPayloadLabel}>
            <span>Pix copia e cola</span>
            <textarea
              className={styles.pixPayload}
              readOnly
              value={pixCopiaCola}
            />
          </label>
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
            {modo !== 'gerenciar' && (
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading}
              >
                {loading ? 'Gerando...' : rotuloAcao(modo)}
              </button>
            )}
          </footer>
        </form>
      </section>
    </div>
  );
}
