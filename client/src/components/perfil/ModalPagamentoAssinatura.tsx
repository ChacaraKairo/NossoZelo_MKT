import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { assinaturaService } from '@/service/assinaturaService';
import {
  DadosPagamentoAssinatura,
  MetodoPagamentoAssinatura,
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

const estadoInicialCartao = {
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  ccv: '',
};

const estadoInicialTitular = {
  name: '',
  email: '',
  cpfCnpj: '',
  postalCode: '',
  addressNumber: '',
  addressComplement: '',
  phone: '',
  mobilePhone: '',
};

function rotuloAcao(modo: ModoModalPagamentoAssinatura) {
  if (modo === 'gerenciar') return 'Gerenciar pagamento';
  if (modo === 'iniciar') return 'Iniciar assinatura';
  return 'Regularizar assinatura';
}

function mensagemPorStatus(resultado: RespostaAssinatura) {
  const gateway = resultado.gateway_resultado;

  if (gateway.mensagem) return gateway.mensagem;
  if (gateway.status === 'recusado') {
    return 'Pagamento recusado. Revise os dados ou use outro metodo.';
  }
  if (gateway.status === 'aprovado') {
    return 'Pagamento aprovado. A ativacao sera confirmada pelo webhook.';
  }

  return 'Pagamento enviado para analise. Aguarde a confirmacao automatica.';
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
  const [metodoPagamento, setMetodoPagamento] =
    useState<MetodoPagamentoAssinatura>('credit_card');
  const [cartao, setCartao] = useState(estadoInicialCartao);
  const [titular, setTitular] = useState(estadoInicialTitular);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aberto) {
      setErro(null);
      setSucesso(null);
      setLinkPagamento(null);
      setPixCopiaCola(null);
      setPixImagem(null);
      setMetodoPagamento('credit_card');
      setCartao(estadoInicialCartao);
      setTitular(estadoInicialTitular);
      setLoading(false);
    }
  }, [aberto]);

  if (!aberto) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (modo === 'gerenciar') return;

    if (!Number.isInteger(planoId) || !planoId || planoId <= 0) {
      setErro('Selecione um plano antes de continuar.');
      setSucesso(null);
      return;
    }

    const dadosPagamento: DadosPagamentoAssinatura =
      metodoPagamento === 'credit_card'
        ? {
            metodoPagamento,
            creditCard: cartao,
            creditCardHolderInfo: {
              ...titular,
              addressComplement: titular.addressComplement || null,
              phone: titular.phone || null,
              mobilePhone: titular.mobilePhone || null,
            },
          }
        : { metodoPagamento };

    try {
      setLoading(true);
      setErro(null);
      setSucesso(null);
      const resultado =
        modo === 'iniciar'
          ? await assinaturaService.iniciarAssinatura(
              planoId,
              dadosPagamento,
            )
          : await assinaturaService.regularizarAssinatura(
              planoId,
              dadosPagamento,
            );
      const gateway = resultado.gateway_resultado;
      const mensagem = mensagemPorStatus(resultado);

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
              O pagamento sera processado pelo Asaas. A assinatura local so
              fica ativa depois da confirmacao por webhook.
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
          Status atual: {statusAssinatura}. Numero completo do cartao e CVV sao
          enviados apenas ao Asaas nesta tentativa e nao sao salvos pelo
          NossoZelo.
        </div>

        {modo === 'gerenciar' && (
          <div className={styles.securityNote}>
            Nesta etapa ainda nao existe troca de cartao dentro do NossoZelo. O
            pagamento deve ser acompanhado pelo ambiente do Asaas.
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
          {modo !== 'gerenciar' && (
            <>
              <fieldset className={styles.methodGroup}>
                <legend>Metodo de pagamento</legend>
                {[
                  ['credit_card', 'Cartao de credito'],
                  ['asaas_invoice', 'Debito ou checkout Asaas'],
                  ['pix', 'Pix'],
                  ['boleto', 'Boleto'],
                ].map(([valor, label]) => (
                  <label key={valor}>
                    <input
                      type="radio"
                      name="metodoPagamento"
                      value={valor}
                      checked={metodoPagamento === valor}
                      onChange={() =>
                        setMetodoPagamento(
                          valor as MetodoPagamentoAssinatura,
                        )
                      }
                      disabled={loading}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>

              {metodoPagamento === 'asaas_invoice' && (
                <div className={styles.securityNote}>
                  Voce sera direcionado para a fatura segura do Asaas. A opcao
                  de debito pode aparecer no checkout quando habilitada pelo
                  Asaas.
                </div>
              )}

              {metodoPagamento === 'credit_card' && (
                <>
                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span>Nome impresso</span>
                      <input
                        value={cartao.holderName}
                        onChange={(event) =>
                          setCartao({
                            ...cartao,
                            holderName: event.target.value,
                          })
                        }
                        autoComplete="cc-name"
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Numero do cartao</span>
                      <input
                        value={cartao.number}
                        onChange={(event) =>
                          setCartao({
                            ...cartao,
                            number: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        autoComplete="cc-number"
                        maxLength={19}
                        required
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className={styles.rowThree}>
                    <label className={styles.field}>
                      <span>Mes</span>
                      <input
                        value={cartao.expiryMonth}
                        onChange={(event) =>
                          setCartao({
                            ...cartao,
                            expiryMonth: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        autoComplete="cc-exp-month"
                        maxLength={2}
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Ano</span>
                      <input
                        value={cartao.expiryYear}
                        onChange={(event) =>
                          setCartao({
                            ...cartao,
                            expiryYear: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        autoComplete="cc-exp-year"
                        maxLength={4}
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>CVV</span>
                      <input
                        value={cartao.ccv}
                        onChange={(event) =>
                          setCartao({
                            ...cartao,
                            ccv: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        maxLength={4}
                        required
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span>Nome do titular</span>
                      <input
                        value={titular.name}
                        onChange={(event) =>
                          setTitular({ ...titular, name: event.target.value })
                        }
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Email do titular</span>
                      <input
                        type="email"
                        value={titular.email}
                        onChange={(event) =>
                          setTitular({ ...titular, email: event.target.value })
                        }
                        required
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span>CPF/CNPJ</span>
                      <input
                        value={titular.cpfCnpj}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            cpfCnpj: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>CEP</span>
                      <input
                        value={titular.postalCode}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            postalCode: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="numeric"
                        required
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span>Numero</span>
                      <input
                        value={titular.addressNumber}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            addressNumber: event.target.value,
                          })
                        }
                        required
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Complemento</span>
                      <input
                        value={titular.addressComplement}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            addressComplement: event.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </label>
                  </div>

                  <div className={styles.row}>
                    <label className={styles.field}>
                      <span>Telefone</span>
                      <input
                        value={titular.phone}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            phone: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="tel"
                        disabled={loading}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Celular</span>
                      <input
                        value={titular.mobilePhone}
                        onChange={(event) =>
                          setTitular({
                            ...titular,
                            mobilePhone: event.target.value.replace(/\D/g, ''),
                          })
                        }
                        inputMode="tel"
                        disabled={loading}
                      />
                    </label>
                  </div>
                </>
              )}
            </>
          )}

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
                {loading ? 'Enviando...' : rotuloAcao(modo)}
              </button>
            )}
          </footer>
        </form>
      </section>
    </div>
  );
}
