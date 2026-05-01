import { FormEvent, useEffect, useMemo, useState } from 'react';
import { assinaturaService } from '@/service/assinaturaService';
import {
  CartaoAssinaturaPayload,
  MetodoPagamentoAssinatura,
  ModoModalCartaoAssinatura,
} from '@/types/assinatura';
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

type FormState = {
  nomeTitular: string;
  cpfTitular: string;
  numeroCartao: string;
  validade: string;
  cvv: string;
  metodoPagamento: MetodoPagamentoAssinatura;
};

const estadoInicial: FormState = {
  nomeTitular: '',
  cpfTitular: '',
  numeroCartao: '',
  validade: '',
  cvv: '',
  metodoPagamento: 'credito',
};

function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

function formatarNumeroCartao(valor: string) {
  return apenasDigitos(valor)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim();
}

function formatarCpf(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarValidade(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function estimarBandeira(numero: string) {
  const digitos = apenasDigitos(numero);
  if (digitos.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(digitos) || /^2[2-7]/.test(digitos)) {
    return 'mastercard';
  }
  if (/^3[47]/.test(digitos)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(digitos)) return 'discover';
  if (/^(4011|4312|4389|4514|4576|5041|5067|509|6277|6362|6363)/.test(digitos)) {
    return 'elo';
  }
  return undefined;
}

function anoCompleto(ano: string) {
  return ano.length === 2 ? `20${ano}` : ano;
}

export default function ModalCartaoAssinatura({
  aberto,
  modo,
  planoId,
  statusAssinatura,
  onFechar,
  onSucesso,
}: ModalCartaoAssinaturaProps) {
  const [form, setForm] = useState<FormState>(estadoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!aberto) {
      setForm(estadoInicial);
      setErro(null);
      setSucesso(null);
      setLoading(false);
    }
  }, [aberto]);

  const titulo = modo === 'trocar_cartao'
    ? 'Trocar cartao da assinatura'
    : 'Regularizar assinatura';
  const descricao = modo === 'trocar_cartao'
    ? 'Atualize o metodo de pagamento usado nas proximas cobrancas.'
    : 'Envie os dados para simulacao mock de pagamento. A confirmacao pode levar ate 72 horas.';
  const bandeira = useMemo(
    () => estimarBandeira(form.numeroCartao),
    [form.numeroCartao],
  );

  if (!aberto) return null;

  function validar() {
    const numero = apenasDigitos(form.numeroCartao);
    const cpf = apenasDigitos(form.cpfTitular);
    const validade = apenasDigitos(form.validade);

    if (!form.nomeTitular.trim()) return 'Informe o nome impresso no cartao.';
    if (cpf.length < 11) return 'Informe um CPF valido para o titular.';
    if (numero.length < 13) return 'Informe um numero de cartao valido.';
    if (validade.length !== 4) return 'Informe a validade no formato MM/AA.';
    const mes = Number(validade.slice(0, 2));
    if (mes < 1 || mes > 12) return 'Informe um mes de validade valido.';
    if (apenasDigitos(form.cvv).length < 3) return 'Informe o CVV.';
    if (!Number.isInteger(planoId) || planoId <= 0) {
      return 'Informe um plano valido antes de continuar.';
    }

    return null;
  }

  function montarPayload(): CartaoAssinaturaPayload {
    const numero = apenasDigitos(form.numeroCartao);
    const validade = apenasDigitos(form.validade);
    const validadeMes = validade.slice(0, 2);
    const validadeAno = anoCompleto(validade.slice(2));

    return {
      planoId,
      metodoPagamento: form.metodoPagamento,
      cartaoToken: `mock_card_token_${Date.now()}`,
      cartaoResumo: {
        nomeTitular: form.nomeTitular.trim(),
        cpfTitular: apenasDigitos(form.cpfTitular),
        numeroFinal: numero.slice(-4),
        validadeMes,
        validadeAno,
        bandeira,
      },
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      setSucesso(null);
      return;
    }

    try {
      setLoading(true);
      setErro(null);
      setSucesso(null);
      const payload = montarPayload();
      const resultado =
        modo === 'trocar_cartao'
          ? await assinaturaService.trocarCartaoAssinaturaMock(payload)
          : await assinaturaService.regularizarAssinaturaComCartaoMock(payload);
      const mensagem =
        'message' in resultado
          ? resultado.message
          : resultado.gateway_resultado.mensagem ||
            'Solicitacao enviada com sucesso.';

      setSucesso(mensagem);
      setForm(estadoInicial);
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
        aria-labelledby="modal-cartao-assinatura-titulo"
      >
        <header className={styles.header}>
          <div>
            <h3 id="modal-cartao-assinatura-titulo">{titulo}</h3>
            <p>{descricao}</p>
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
          Ambiente mock: o numero completo e o CVV nao sao enviados ao backend.
          Status atual: {statusAssinatura}.
        </div>

        {erro && <div className={styles.error}>{erro}</div>}
        {sucesso && <div className={styles.success}>{sucesso}</div>}

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>Nome impresso no cartao</span>
            <input
              value={form.nomeTitular}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  nomeTitular: event.target.value,
                }))
              }
              disabled={loading}
              autoComplete="cc-name"
            />
          </label>

          <label className={styles.field}>
            <span>CPF do titular</span>
            <input
              value={form.cpfTitular}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  cpfTitular: formatarCpf(event.target.value),
                }))
              }
              disabled={loading}
              inputMode="numeric"
              autoComplete="off"
            />
          </label>

          <label className={styles.field}>
            <span>Numero do cartao</span>
            <input
              value={form.numeroCartao}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  numeroCartao: formatarNumeroCartao(event.target.value),
                }))
              }
              disabled={loading}
              inputMode="numeric"
              autoComplete="cc-number"
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Validade MM/AA</span>
              <input
                value={form.validade}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    validade: formatarValidade(event.target.value),
                  }))
                }
                disabled={loading}
                inputMode="numeric"
                autoComplete="cc-exp"
              />
            </label>

            <label className={styles.field}>
              <span>CVV</span>
              <input
                value={form.cvv}
                onChange={(event) =>
                  setForm((atual) => ({
                    ...atual,
                    cvv: apenasDigitos(event.target.value).slice(0, 4),
                  }))
                }
                disabled={loading}
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </label>
          </div>

          <fieldset className={styles.methodGroup}>
            <legend>Tipo de pagamento</legend>
            <label>
              <input
                type="radio"
                name="metodoPagamento"
                checked={form.metodoPagamento === 'credito'}
                onChange={() =>
                  setForm((atual) => ({
                    ...atual,
                    metodoPagamento: 'credito',
                  }))
                }
                disabled={loading}
              />
              Credito
            </label>
            <label>
              <input
                type="radio"
                name="metodoPagamento"
                checked={form.metodoPagamento === 'debito'}
                onChange={() =>
                  setForm((atual) => ({
                    ...atual,
                    metodoPagamento: 'debito',
                  }))
                }
                disabled={loading}
              />
              Debito
            </label>
          </fieldset>

          {bandeira && (
            <p className={styles.brandHint}>Bandeira estimada: {bandeira}</p>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onFechar}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
