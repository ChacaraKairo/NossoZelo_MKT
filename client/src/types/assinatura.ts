import { AssinaturaAtual } from '@/types/perfil';

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

export interface GatewayResultado {
  sucesso: boolean;
  status: 'aprovado' | 'pendente' | 'recusado' | 'erro';
  gateway: 'asaas';
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  gatewayPaymentId?: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
  pixQrCode?: PixQrCode | null;
  mensagem?: string;
  confirmacaoExpiraEm?: string | Date;
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
  gateway_resultado: GatewayResultado;
  assinatura: AssinaturaAtual;
  pagamento?: {
    recebido: boolean;
    metodoPagamento?: 'pix';
  };
}

export interface RespostaCancelarAssinatura {
  message: string;
  assinatura: AssinaturaAtual;
}
