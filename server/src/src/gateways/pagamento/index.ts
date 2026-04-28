import { GATEWAY_PAGAMENTO } from '../../constants/financeiro';
import { MockPagamentoGateway } from './MockPagamentoGateway';
import { PagamentoGateway } from './PagamentoGateway';

export function obterPagamentoGateway(): PagamentoGateway {
  const gateway = process.env.PAYMENT_GATEWAY || GATEWAY_PAGAMENTO.mock;

  if (gateway === GATEWAY_PAGAMENTO.mock) {
    return new MockPagamentoGateway();
  }

  if (gateway === GATEWAY_PAGAMENTO.asaas) {
    throw new Error('Gateway Asaas ainda não implementado nesta etapa.');
  }

  throw new Error(`Gateway de pagamento invalido: ${gateway}`);
}

export * from './PagamentoGateway';
