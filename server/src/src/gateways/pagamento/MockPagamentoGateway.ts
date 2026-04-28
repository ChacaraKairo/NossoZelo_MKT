import {
  GATEWAY_PAGAMENTO,
  HORAS_CONFIRMACAO_PAGAMENTO,
} from '../../constants/financeiro';
import {
  ConsultaAssinaturaResultado,
  CriarAssinaturaMensalInput,
  CriarAssinaturaResultado,
  CriarClienteInput,
  CriarClienteResultado,
  GatewayStatusAssinatura,
  PagamentoGateway,
} from './PagamentoGateway';

function idMock(prefixo: string) {
  return `${prefixo}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function resultadoMock(): GatewayStatusAssinatura {
  const resultado = process.env.MOCK_PAYMENT_RESULT || 'pendente';
  if (
    resultado === 'aprovado' ||
    resultado === 'pendente' ||
    resultado === 'recusado' ||
    resultado === 'erro'
  ) {
    return resultado;
  }

  return 'pendente';
}

export class MockPagamentoGateway implements PagamentoGateway {
  async criarCliente(
    input: CriarClienteInput,
  ): Promise<CriarClienteResultado> {
    return {
      sucesso: true,
      gateway: GATEWAY_PAGAMENTO.mock,
      gatewayCustomerId: idMock(`cus_${input.cpfCnpj.replace(/\D/g, '') || 'mock'}`),
      mensagem: 'Cliente mock criado com sucesso.',
    };
  }

  async criarAssinaturaMensal(
    input: CriarAssinaturaMensalInput,
  ): Promise<CriarAssinaturaResultado> {
    const status = resultadoMock();
    const gatewayCustomerId =
      input.gatewayCustomerId || idMock(`cus_${input.prestadorId}`);

    if (status === 'erro') {
      const error = new Error(
        'Gateway mock retornou erro controlado ao criar assinatura.',
      ) as Error & { status?: number };
      error.status = 502;
      throw error;
    }

    if (status === 'recusado') {
      return {
        sucesso: false,
        status,
        gateway: GATEWAY_PAGAMENTO.mock,
        gatewayCustomerId,
        mensagem:
          'Pagamento recusado pelo gateway mock. Regularize a assinatura para ativar o perfil profissional.',
      };
    }

    if (status === 'aprovado') {
      return {
        sucesso: true,
        status,
        gateway: GATEWAY_PAGAMENTO.mock,
        gatewayCustomerId,
        gatewaySubscriptionId: idMock(`sub_${input.prestadorId}`),
        mensagem: 'Assinatura mock aprovada.',
      };
    }

    const confirmacaoExpiraEm = new Date();
    confirmacaoExpiraEm.setHours(
      confirmacaoExpiraEm.getHours() + HORAS_CONFIRMACAO_PAGAMENTO,
    );

    return {
      sucesso: true,
      status,
      gateway: GATEWAY_PAGAMENTO.mock,
      gatewayCustomerId,
      gatewaySubscriptionId: idMock(`sub_${input.prestadorId}`),
      mensagem:
        'Assinatura mock criada e aguardando confirmacao de pagamento.',
      confirmacaoExpiraEm,
    };
  }

  async cancelarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado> {
    return {
      sucesso: true,
      status: 'recusado',
      gateway: GATEWAY_PAGAMENTO.mock,
      gatewaySubscriptionId,
      mensagem: 'Assinatura mock cancelada.',
    };
  }

  async consultarAssinatura(
    gatewaySubscriptionId: string,
  ): Promise<ConsultaAssinaturaResultado> {
    return {
      sucesso: true,
      status: resultadoMock(),
      gateway: GATEWAY_PAGAMENTO.mock,
      gatewaySubscriptionId,
      mensagem: 'Consulta mock realizada.',
    };
  }
}
