import { GATEWAY_PAGAMENTO } from '../../constants/financeiro';
import { AsaasPagamentoGateway } from './AsaasPagamentoGateway';
import { PagamentoGateway } from './PagamentoGateway';

export function obterPagamentoGateway(): PagamentoGateway {
  const gateway = process.env.PAYMENT_GATEWAY || GATEWAY_PAGAMENTO.asaas;

  if (gateway === GATEWAY_PAGAMENTO.asaas) {
    return new AsaasPagamentoGateway();
  }

  throw new Error(`Gateway de pagamento invalido: ${gateway}`);
}

export * from './PagamentoGateway';
