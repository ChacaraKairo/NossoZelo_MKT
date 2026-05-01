import { AssinaturaAtual } from '@/types/perfil';

export type MetodoPagamentoAssinatura = 'credito' | 'debito';

export type ModoModalCartaoAssinatura = 'regularizar' | 'trocar_cartao';

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
  cartaoToken: string;
  cartaoResumo: CartaoResumoAssinatura;
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

export interface RespostaAssinaturaMock {
  gateway_resultado: {
    sucesso: boolean;
    status: 'aprovado' | 'pendente' | 'recusado' | 'erro';
    gateway: 'mock' | 'asaas';
    gatewaySubscriptionId?: string;
    gatewayCustomerId?: string;
    mensagem?: string;
    confirmacaoExpiraEm?: string | Date;
  };
  assinatura: AssinaturaAtual;
  pagamento_mock?: {
    recebido: boolean;
    metodoPagamento?: MetodoPagamentoAssinatura;
    cartaoResumo?: CartaoResumoAssinatura;
  };
}

export interface RespostaTrocarCartaoMock {
  message: string;
  assinatura: AssinaturaAtual;
  pagamento_mock: {
    recebido: boolean;
    metodoPagamento: MetodoPagamentoAssinatura;
    cartaoResumo: CartaoResumoAssinatura;
  };
}

export interface RespostaCancelarAssinatura {
  message: string;
  assinatura: AssinaturaAtual;
}
