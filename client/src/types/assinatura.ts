export type ModoModalPagamentoAssinatura =
  | 'iniciar'
  | 'regularizar'
  | 'gerenciar';

export interface PlanoAssinatura {
  id: number;
  nome: string;
  valor: number;
  beneficios?: string | null;
}

export interface PixQrCode {
  encodedImage?: string | null;
  payload?: string | null;
  expirationDate?: string | null;
}

export type StatusAssinatura =
  | 'pendente'
  | 'aguardando_confirmacao'
  | 'ativa'
  | 'atrasada'
  | 'bloqueada'
  | 'cancelada'
  | 'falhou'
  | 'expirada';

export type StatusGatewayPagamento =
  | 'aprovado'
  | 'pendente'
  | 'recusado'
  | 'erro';

export type ProximaAcaoAssinatura =
  | 'aguardar_webhook'
  | 'pagar_fatura'
  | 'regularizar_pagamento'
  | 'confirmar_email'
  | 'nenhuma';

export type MetodoPagamentoAssinatura =
  | 'credit_card'
  | 'asaas_invoice'
  | 'pix'
  | 'boleto';

export interface DadosCartaoCredito {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface DadosTitularCartao {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
}

export interface DadosPagamentoAssinatura {
  metodoPagamento: MetodoPagamentoAssinatura;
  creditCard?: DadosCartaoCredito;
  creditCardHolderInfo?: DadosTitularCartao;
  creditCardToken?: string;
}

export interface StatusAssinaturaPrestador {
  prestador_id: string;
  status_cadastro: string;
  assinatura_atual: AssinaturaAtual | null;
  assinatura_status: string;
  assinatura_confirmacao_expira_em?: string | Date | null;
  perfil_profissional_ativo: boolean;
  pode_aparecer_na_busca: boolean;
  pode_receber_pedidos: boolean;
  motivo_perfil_inativo?: string | null;
}

export interface AssinaturaContrato {
  id: number | null;
  status: StatusAssinatura;
  plano_id: number | null;
  gateway: 'asaas' | null;
  gateway_subscription_id: string | null;
  gateway_payment_id?: string | null;
  data_ultimo_pagamento: string | null;
  data_proximo_vencimento: string | null;
  confirmacao_expira_em: string | null;
}

export interface AcessoAssinaturaContrato {
  liberado: boolean;
  perfil_profissional_ativo: boolean;
  pode_aparecer_na_busca: boolean;
  pode_receber_pedidos: boolean;
  motivo_bloqueio: string | null;
  mensagem_usuario: string;
  proxima_acao: ProximaAcaoAssinatura;
}

export interface PagamentoAssinaturaContrato {
  status_gateway: StatusGatewayPagamento;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pixQrCode?: PixQrCode | null;
  mensagem_gateway?: string;
}

export interface RespostaAssinatura {
  assinatura: AssinaturaContrato;
  acesso: AcessoAssinaturaContrato;
  pagamento: PagamentoAssinaturaContrato;
}

export interface RespostaCancelarAssinatura extends RespostaAssinatura {
  message: string;
}
