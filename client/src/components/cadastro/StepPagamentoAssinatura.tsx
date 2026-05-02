import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { emailConfirmacaoService } from '@/service/emailConfirmacaoService';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import {
  ConfirmacaoPagamentoCadastroPayload,
  MetodoPagamentoAssinatura,
} from '@/types/assinatura';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import Style from '@/styles/Wizard.module.css';

type Estado =
  | 'aguardando_email'
  | 'escolher_pagamento'
  | 'confirmando'
  | 'pagamento'
  | 'erro';

type FormCartao = {
  nomeTitular: string;
  cpfTitular: string;
  numero: string;
  validade: string;
  cvv: string;
  cep: string;
  numeroEndereco: string;
};

const metodosPagamento: Array<{
  id: MetodoPagamentoAssinatura;
  titulo: string;
  descricao: string;
}> = [
  {
    id: 'pix',
    titulo: 'Pix recorrente',
    descricao: 'Gera a primeira cobrança Pix e mantém a assinatura mensal.',
  },
  {
    id: 'credito',
    titulo: 'Cartão de crédito',
    descricao: 'Cobra a assinatura recorrente direto no cartão informado.',
  },
  {
    id: 'debito',
    titulo: 'Débito',
    descricao: 'Gera a fatura no Asaas para pagamento quando disponível.',
  },
];

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, '');
}

function ultimosDigitosCartao(numero: string) {
  return somenteNumeros(numero).slice(-4);
}

function bandeiraCartao(numero: string) {
  const limpo = somenteNumeros(numero);
  if (/^4/.test(limpo)) return 'Visa';
  if (/^5[1-5]/.test(limpo) || /^2[2-7]/.test(limpo)) return 'Mastercard';
  if (/^3[47]/.test(limpo)) return 'American Express';
  if (/^6/.test(limpo)) return 'Elo/Hipercard';
  return 'Cartão';
}

function separarValidade(validade: string) {
  const limpo = somenteNumeros(validade);
  const mes = limpo.slice(0, 2);
  const anoCurto = limpo.slice(2, 4);
  const ano = anoCurto.length === 2 ? `20${anoCurto}` : '';
  return { mes, ano, anoCurto };
}

export default function StepPagamentoAssinatura() {
  const router = useRouter();
  const { dadosPessoais, endereco } = useCadastroPrestadorStore();
  const [estado, setEstado] = useState<Estado>('aguardando_email');
  const [mensagem, setMensagem] = useState(
    'Enviamos um link para o e-mail informado. Confirme o e-mail para gerar a assinatura.',
  );
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [pixImagem, setPixImagem] = useState<string | null>(null);
  const [tokenConfirmacao, setTokenConfirmacao] = useState('');
  const [metodoPagamento, setMetodoPagamento] =
    useState<MetodoPagamentoAssinatura>('pix');
  const [erroFormulario, setErroFormulario] = useState('');
  const [cartao, setCartao] = useState<FormCartao>({
    nomeTitular: '',
    cpfTitular: '',
    numero: '',
    validade: '',
    cvv: '',
    cep: '',
    numeroEndereco: '',
  });

  const dadosPrefill = useMemo(
    () => ({
      nomeTitular: `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim(),
      cpfTitular: dadosPessoais.cpf,
      cep: endereco.cep,
      numeroEndereco: endereco.numero,
    }),
    [
      dadosPessoais.cpf,
      dadosPessoais.nome,
      dadosPessoais.sobrenome,
      endereco.cep,
      endereco.numero,
    ],
  );

  useEffect(() => {
    setCartao((atual) => ({
      ...atual,
      nomeTitular: atual.nomeTitular || dadosPrefill.nomeTitular,
      cpfTitular: atual.cpfTitular || dadosPrefill.cpfTitular,
      cep: atual.cep || dadosPrefill.cep,
      numeroEndereco: atual.numeroEndereco || dadosPrefill.numeroEndereco,
    }));
  }, [dadosPrefill]);

  useEffect(() => {
    if (!router.isReady) return;

    const token =
      typeof router.query.confirmar_email === 'string'
        ? router.query.confirmar_email
        : '';

    if (!token) {
      setEstado('aguardando_email');
      return;
    }

    setTokenConfirmacao(token);
    setEstado('escolher_pagamento');
    setMensagem('E-mail localizado. Escolha como deseja realizar a assinatura.');
  }, [router.isReady, router.query.confirmar_email]);

  function atualizarCartao(campo: keyof FormCartao, valor: string) {
    setCartao((atual) => ({ ...atual, [campo]: valor }));
    setErroFormulario('');
  }

  function validarCartao() {
    const numero = somenteNumeros(cartao.numero);
    const { mes, ano } = separarValidade(cartao.validade);
    const cvv = somenteNumeros(cartao.cvv);
    const cpf = somenteNumeros(cartao.cpfTitular);
    const cep = somenteNumeros(cartao.cep);

    if (!cartao.nomeTitular.trim()) return 'Informe o nome impresso no cartão.';
    if (cpf.length !== 11) return 'Informe o CPF do titular com 11 dígitos.';
    if (numero.length < 13 || numero.length > 19) {
      return 'Informe um número de cartão válido.';
    }
    if (!/^(0[1-9]|1[0-2])$/.test(mes) || !/^\d{4}$/.test(ano)) {
      return 'Informe a validade no formato MM/AA.';
    }
    if (cvv.length < 3 || cvv.length > 4) return 'Informe o CVV do cartão.';
    if (cep.length !== 8) return 'Informe o CEP do titular com 8 dígitos.';
    if (!cartao.numeroEndereco.trim()) {
      return 'Informe o número do endereço do titular.';
    }

    return '';
  }

  function montarPayload(): ConfirmacaoPagamentoCadastroPayload {
    if (metodoPagamento !== 'credito') {
      return { token: tokenConfirmacao, metodoPagamento };
    }

    const { mes, ano, anoCurto } = separarValidade(cartao.validade);
    const numero = somenteNumeros(cartao.numero);

    return {
      token: tokenConfirmacao,
      metodoPagamento,
      cartaoResumo: {
        nomeTitular: cartao.nomeTitular.trim(),
        cpfTitular: somenteNumeros(cartao.cpfTitular),
        numeroFinal: ultimosDigitosCartao(cartao.numero),
        validadeMes: mes,
        validadeAno: anoCurto,
        bandeira: bandeiraCartao(cartao.numero),
      },
      cartaoCredito: {
        holderName: cartao.nomeTitular.trim(),
        number: numero,
        expiryMonth: mes,
        expiryYear: ano,
        ccv: somenteNumeros(cartao.cvv),
        postalCode: somenteNumeros(cartao.cep),
        addressNumber: cartao.numeroEndereco.trim(),
      },
    };
  }

  async function confirmarEPagar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tokenConfirmacao) return;
    if (metodoPagamento === 'credito') {
      const erro = validarCartao();
      if (erro) {
        setErroFormulario(erro);
        return;
      }
    }

    setEstado('confirmando');
    setErroFormulario('');
    setMensagem('Confirmando seu e-mail e criando sua assinatura no Asaas...');

    try {
      const resposta =
        await emailConfirmacaoService.confirmarEmailComPagamento(
          montarPayload(),
        );
      const gateway = resposta.pagamento_cadastro?.gateway_resultado;
      setLinkPagamento(gateway?.invoiceUrl || gateway?.bankSlipUrl || null);
      setPixCopiaCola(gateway?.pixQrCode?.payload || null);
      setPixImagem(gateway?.pixQrCode?.encodedImage || null);
      setEstado('pagamento');
      setMensagem(
        gateway?.mensagem ||
          resposta.pagamento_cadastro?.message ||
          'E-mail confirmado. Conclua o pagamento para ativar seu perfil profissional.',
      );
    } catch (error) {
      setEstado('erro');
      setMensagem(extrairMensagemErro(error));
    }
  }

  return (
    <div className={Style.paymentStep}>
      <div
        className={
          estado === 'erro'
            ? Style.validationBanner
            : estado === 'pagamento'
              ? Style.successBanner
              : Style.infoBanner
        }
      >
        <h3>
          {estado === 'pagamento'
            ? 'Assinatura gerada'
            : estado === 'confirmando'
              ? 'Confirmando e-mail'
              : estado === 'erro'
                ? 'Não foi possível continuar'
                : 'Confirme seu e-mail'}
        </h3>
        <p>{mensagem}</p>
      </div>

      {estado === 'escolher_pagamento' && (
        <form className={Style.paymentForm} onSubmit={confirmarEPagar}>
          <div className={Style.paymentMethods}>
            {metodosPagamento.map((metodo) => (
              <button
                key={metodo.id}
                type="button"
                className={`${Style.paymentMethodButton} ${
                  metodoPagamento === metodo.id
                    ? Style.paymentMethodButtonActive
                    : ''
                }`}
                onClick={() => setMetodoPagamento(metodo.id)}
              >
                <strong>{metodo.titulo}</strong>
                <span>{metodo.descricao}</span>
              </button>
            ))}
          </div>

          {metodoPagamento === 'credito' && (
            <div className={Style.cardPaymentBox}>
              <div className={Style.inputGroup}>
                <label htmlFor="card-holder">Nome impresso no cartão</label>
                <input
                  id="card-holder"
                  type="text"
                  value={cartao.nomeTitular}
                  onChange={(event) =>
                    atualizarCartao('nomeTitular', event.target.value)
                  }
                  autoComplete="cc-name"
                />
              </div>

              <div className={Style.inputRow}>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-cpf">CPF do titular</label>
                  <input
                    id="card-cpf"
                    type="text"
                    value={cartao.cpfTitular}
                    onChange={(event) =>
                      atualizarCartao('cpfTitular', event.target.value)
                    }
                    inputMode="numeric"
                    autoComplete="off"
                  />
                </div>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-number">Número do cartão</label>
                  <input
                    id="card-number"
                    type="text"
                    value={cartao.numero}
                    onChange={(event) =>
                      atualizarCartao('numero', event.target.value)
                    }
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </div>
              </div>

              <div className={Style.inputRow}>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-expiry">Validade</label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/AA"
                    value={cartao.validade}
                    onChange={(event) =>
                      atualizarCartao('validade', event.target.value)
                    }
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </div>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-cvv">CVV</label>
                  <input
                    id="card-cvv"
                    type="password"
                    value={cartao.cvv}
                    onChange={(event) =>
                      atualizarCartao('cvv', event.target.value)
                    }
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </div>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-cep">CEP do titular</label>
                  <input
                    id="card-cep"
                    type="text"
                    value={cartao.cep}
                    onChange={(event) =>
                      atualizarCartao('cep', event.target.value)
                    }
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                </div>
                <div className={Style.inputGroup}>
                  <label htmlFor="card-address-number">Número</label>
                  <input
                    id="card-address-number"
                    type="text"
                    value={cartao.numeroEndereco}
                    onChange={(event) =>
                      atualizarCartao('numeroEndereco', event.target.value)
                    }
                    autoComplete="address-line2"
                  />
                </div>
              </div>
            </div>
          )}

          {metodoPagamento === 'pix' && (
            <p className={Style.fieldHelpText}>
              O cadastro confirma o e-mail e cria a assinatura mensal no Asaas.
              A primeira cobrança retorna com QR Code e Pix copia e cola.
            </p>
          )}

          {metodoPagamento === 'debito' && (
            <p className={Style.fieldHelpText}>
              O Asaas cria a assinatura com forma aberta para pagamento na
              fatura. Quando o débito estiver disponível para a cobrança, o
              prestador escolhe essa opção no ambiente seguro do Asaas.
            </p>
          )}

          {erroFormulario && (
            <p className={Style.errorText}>{erroFormulario}</p>
          )}

          <button
            type="submit"
            className={Style.btnSubmit}
          >
            {metodoPagamento === 'credito'
              ? 'Confirmar e assinar no cartão'
              : metodoPagamento === 'debito'
                ? 'Confirmar e gerar fatura'
                : 'Confirmar e gerar Pix'}
          </button>
        </form>
      )}

      {linkPagamento && (
        <a
          className={Style.paymentButton}
          href={linkPagamento}
          target="_blank"
          rel="noreferrer"
        >
          Abrir pagamento no Asaas
        </a>
      )}

      {pixImagem && (
        <Image
          className={Style.pixQrImage}
          src={`data:image/png;base64,${pixImagem}`}
          alt="QR Code Pix da assinatura"
          width={180}
          height={180}
          unoptimized
        />
      )}

      {pixCopiaCola && (
        <label className={Style.pixBox}>
          <span>Pix copia e cola</span>
          <textarea readOnly value={pixCopiaCola} />
        </label>
      )}

      <p className={Style.fieldHelpText}>
        Seu perfil profissional só fica ativo depois que o Asaas confirmar o
        pagamento pelo webhook.
      </p>
    </div>
  );
}
