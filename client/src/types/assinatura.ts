import { AssinaturaAtual } from '@/types/perfil';

export type MetodoPagamentoAssinatura = 'pix' | 'credito' | 'debito';

export type ModoModalCartaoAssinatura = 'regularizar';

export interface CartaoResumoAssinatura {
  nomeTitular: string;
  cpfTitular: string;
  numeroFinal: string;
  validadeMes: string;
  validadeAno: string;
  bandeira?: string;
}

export interface CartaoAssinaturaPayload {
  planoId: number;
  metodoPagamento: MetodoPagamentoAssinatura;
  cartaoToken?: string;
  cartaoResumo: CartaoResumoAssinatura;
}

export interface CartaoCreditoAssinatura {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  postalCode: string;
  addressNumber: string;
}

export interface ConfirmacaoPagamentoCadastroPayload {
  token: string;
  metodoPagamento: MetodoPagamentoAssinatura;
  cartaoToken?: string;
  cartaoResumo?: CartaoResumoAssinatura;
  cartaoCredito?: CartaoCreditoAssinatura;
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

export interface RespostaAssinatura {
  gateway_resultado: {
    sucesso: boolean;
    status: 'aprovado' | 'pendente' | 'recusado' | 'erro';
    gateway: 'asaas';
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
    confirmacaoExpiraEm?: string | Date;
  };
  assinatura: AssinaturaAtual;
  pagamento?: {
    recebido: boolean;
    metodoPagamento?: MetodoPagamentoAssinatura;
    cartaoResumo?: CartaoResumoAssinatura;
  };
}

export interface RespostaCancelarAssinatura {
  message: string;
  assinatura: AssinaturaAtual;
}
