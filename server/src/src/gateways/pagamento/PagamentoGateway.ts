import { GatewayPagamento } from '../../constants/financeiro';

export type GatewayStatusAssinatura =
  | 'aprovado'
  | 'pendente'
  | 'recusado'
  | 'erro';

export type CriarClienteInput = {
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone?: string | null;
};

export type CriarClienteResultado = {
  sucesso: boolean;
  gateway: GatewayPagamento;
  gatewayCustomerId?: string;
  mensagem?: string;
};

export type CriarAssinaturaMensalInput = {
  prestadorId: string;
  planoId: number;
  valor: number;
  nome: string;
  email: string;
  cpfCnpj: string;
  telefone?: string | null;
  gatewayCustomerId?: string | null;
};

export type CriarAssinaturaResultado = {
  sucesso: boolean;
  status: GatewayStatusAssinatura;
  gateway: GatewayPagamento;
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  gatewayPaymentId?: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pixQrCode?: {
    encodedImage?: string | null;
    payload?: string | null;
    expirationDate?: string | null;
  } | null;
  mensagem?: string;
  confirmacaoExpiraEm?: Date;
};

export type ConsultaAssinaturaResultado = {
  sucesso: boolean;
  status: GatewayStatusAssinatura;
  gateway: GatewayPagamento;
  gatewaySubscriptionId: string;
  mensagem?: string;
};

export interface PagamentoGateway {
  criarCliente(
    input: CriarClienteInput,
  ): Promise<CriarClienteResultado>;

  criarAssinaturaMensal(
    input: CriarAssinaturaMensalInput,
  ): Promise<CriarAssinaturaResultado>;

  cancelarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado>;

  consultarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado>;
}
