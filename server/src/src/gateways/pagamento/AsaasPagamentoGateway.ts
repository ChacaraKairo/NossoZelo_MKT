import axios, { AxiosError, AxiosInstance } from 'axios';
import { GATEWAY_PAGAMENTO } from '../../constants/financeiro';
import {
  ConsultaAssinaturaResultado,
  CriarAssinaturaMensalInput,
  CriarAssinaturaResultado,
  CriarClienteInput,
  CriarClienteResultado,
  GatewayStatusAssinatura,
  PagamentoGateway,
} from './PagamentoGateway';

type AsaasCustomerResponse = {
  id: string;
};

type AsaasSubscriptionResponse = {
  id: string;
  customer?: string;
  status?: string;
  deleted?: boolean;
};

type AsaasPaymentResponse = {
  id: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  status?: string;
};

type AsaasPaymentListResponse = {
  data?: AsaasPaymentResponse[];
};

type AsaasPixQrCodeResponse = {
  encodedImage?: string | null;
  payload?: string | null;
  expirationDate?: string | null;
};

function apiKeyObrigatoria() {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY nao configurada.');
  }
  return apiKey;
}

function baseUrlAsaas() {
  return (
    process.env.ASAAS_BASE_URL?.trim() ||
    'https://api-sandbox.asaas.com/v3'
  ).replace(/\/$/, '');
}

function dataIsoSomenteData(data: Date) {
  return data.toISOString().slice(0, 10);
}

function adicionarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function billingTypeAssinatura(input: CriarAssinaturaMensalInput) {
  const configurado = (process.env.ASAAS_BILLING_TYPE || 'PIX')
    .trim()
    .toUpperCase();
  const permitidos = ['PIX', 'BOLETO', 'UNDEFINED'];

  return permitidos.includes(configurado) ? configurado : 'PIX';
}

function mensagemPorBillingType(billingType: string) {
  if (billingType === 'PIX') {
    return 'Assinatura Pix recorrente criada no Asaas. Pague a primeira cobranca para ativar o perfil.';
  }

  if (billingType === 'UNDEFINED') {
    return 'Assinatura criada no Asaas. Abra a fatura para escolher a forma de pagamento disponivel.';
  }

  return 'Assinatura criada no Asaas. Aguarde confirmacao por webhook de pagamento.';
}

function complementoSemCobrancaAcessivel(
  pagamento?: AsaasPaymentResponse,
  pixQrCode?: AsaasPixQrCodeResponse | null,
) {
  const temPix = Boolean(pixQrCode?.payload || pixQrCode?.encodedImage);
  const temLink = Boolean(pagamento?.invoiceUrl || pagamento?.bankSlipUrl);

  if (temPix || temLink) return '';

  return ' O Asaas ainda nao retornou link ou Pix da primeira cobranca; tente abrir a assinatura novamente em alguns segundos ou consulte o Asaas.';
}

function normalizarStatusAsaas(status?: string): GatewayStatusAssinatura {
  const valor = status?.toUpperCase();
  if (valor === 'ACTIVE') return 'pendente';
  if (valor === 'INACTIVE' || valor === 'EXPIRED' || valor === 'DELETED') {
    return 'recusado';
  }
  return 'pendente';
}

function mensagemErroAsaas(error: unknown) {
  const axiosError = error as AxiosError<any>;
  const errors = axiosError.response?.data?.errors;
  if (Array.isArray(errors) && errors[0]?.description) {
    return String(errors[0].description);
  }

  if (axiosError.response?.data?.message) {
    return String(axiosError.response.data.message);
  }

  return error instanceof Error
    ? error.message
    : 'Erro ao comunicar com o Asaas.';
}

function isPix(input: CriarAssinaturaMensalInput) {
  return billingTypeAssinatura(input).toUpperCase() === 'PIX';
}

export class AsaasPagamentoGateway implements PagamentoGateway {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: baseUrlAsaas(),
      timeout: Number(process.env.ASAAS_TIMEOUT_MS || 60000),
      headers: {
        access_token: apiKeyObrigatoria(),
        'Content-Type': 'application/json',
      },
    });
  }

  async criarCliente(
    input: CriarClienteInput,
  ): Promise<CriarClienteResultado> {
    try {
      const response = await this.client.post<AsaasCustomerResponse>(
        '/customers',
        {
          name: input.nome,
          email: input.email,
          cpfCnpj: input.cpfCnpj.replace(/\D/g, ''),
          mobilePhone: input.telefone?.replace(/\D/g, '') || undefined,
        },
      );

      return {
        sucesso: true,
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewayCustomerId: response.data.id,
        mensagem: 'Cliente criado no Asaas.',
      };
    } catch (error) {
      return {
        sucesso: false,
        gateway: GATEWAY_PAGAMENTO.asaas,
        mensagem: mensagemErroAsaas(error),
      };
    }
  }

  async criarAssinaturaMensal(
    input: CriarAssinaturaMensalInput,
  ): Promise<CriarAssinaturaResultado> {
    try {
      if (!input.gatewayCustomerId) {
        throw new Error('Cliente gateway nao informado para assinatura.');
      }

      const billingType = billingTypeAssinatura(input);
      const response = await this.client.post<AsaasSubscriptionResponse>(
        '/subscriptions',
        {
          customer: input.gatewayCustomerId,
          billingType,
          value: input.valor,
          nextDueDate: dataIsoSomenteData(new Date()),
          cycle: 'MONTHLY',
          description: 'Assinatura Profissional NossoZelo',
          externalReference: input.prestadorId,
        },
      );
      const paymentsResponse =
        await this.client.get<AsaasPaymentListResponse>(
          `/subscriptions/${response.data.id}/payments`,
          { params: { limit: 1 } },
        );
      const primeiraCobranca = paymentsResponse.data.data?.[0];
      const pixQrCode =
        primeiraCobranca?.id && isPix(input)
          ? await this.client
              .get<AsaasPixQrCodeResponse>(
                `/payments/${primeiraCobranca.id}/pixQrCode`,
              )
              .then((pixResponse) => pixResponse.data)
              .catch(() => null)
          : null;
      const mensagem =
        mensagemPorBillingType(billingType) +
        complementoSemCobrancaAcessivel(primeiraCobranca, pixQrCode);

      return {
        sucesso: true,
        status: normalizarStatusAsaas(response.data.status),
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewaySubscriptionId: response.data.id,
        gatewayCustomerId: response.data.customer || input.gatewayCustomerId,
        gatewayPaymentId: primeiraCobranca?.id,
        invoiceUrl: primeiraCobranca?.invoiceUrl || null,
        bankSlipUrl: primeiraCobranca?.bankSlipUrl || null,
        pixQrCode,
        mensagem,
        confirmacaoExpiraEm: adicionarDias(new Date(), 3),
      };
    } catch (error) {
      return {
        sucesso: false,
        status: 'erro',
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewayCustomerId: input.gatewayCustomerId || undefined,
        mensagem: mensagemErroAsaas(error),
      };
    }
  }

  async cancelarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado> {
    try {
      await this.client.delete(`/subscriptions/${gatewaySubscriptionId}`);
      return {
        sucesso: true,
        status: 'recusado',
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewaySubscriptionId,
        mensagem: 'Assinatura removida no Asaas.',
      };
    } catch (error) {
      return {
        sucesso: false,
        status: 'erro',
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewaySubscriptionId,
        mensagem: mensagemErroAsaas(error),
      };
    }
  }

  async consultarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado> {
    try {
      const response = await this.client.get<AsaasSubscriptionResponse>(
        `/subscriptions/${gatewaySubscriptionId}`,
      );
      return {
        sucesso: true,
        status: normalizarStatusAsaas(response.data.status),
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewaySubscriptionId,
        mensagem: response.data.status || 'Status consultado no Asaas.',
      };
    } catch (error) {
      return {
        sucesso: false,
        status: 'erro',
        gateway: GATEWAY_PAGAMENTO.asaas,
        gatewaySubscriptionId,
        mensagem: mensagemErroAsaas(error),
      };
    }
  }
}
