import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const client = {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  return {
    client,
    create: vi.fn(() => client),
  };
});

vi.mock('axios', () => ({
  default: {
    create: mocks.create,
  },
}));

import { AsaasPagamentoGateway } from './AsaasPagamentoGateway';

const assinaturaInput = {
  prestadorId: 'prestador-1',
  planoId: 1,
  gatewayCustomerId: 'cus_1',
  valor: 49.9,
  nome: 'Prestador Teste',
  email: 'prestador@test.com',
  cpfCnpj: '12345678901',
  telefone: '11999999999',
};

const dadosPagamentoCredito = {
  metodoPagamento: 'credit_card' as const,
  remoteIp: '203.0.113.10',
  creditCard: {
    holderName: 'Prestador Teste',
    number: '5162306219378829',
    expiryMonth: '05',
    expiryYear: '2028',
    ccv: '318',
  },
  creditCardHolderInfo: {
    name: 'Prestador Teste',
    email: 'prestador@test.com',
    cpfCnpj: '12345678901',
    postalCode: '01001000',
    addressNumber: '100',
    addressComplement: null,
    phone: '1133333333',
    mobilePhone: '11999999999',
  },
};

describe('AsaasPagamentoGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ASAAS_API_KEY = 'asaas-test-key';
    process.env.ASAAS_BASE_URL = 'https://api-sandbox.asaas.com/v3';
    process.env.ASAAS_BILLING_TYPE = 'PIX';
  });

  it('cria customer sanitizando CPF e telefone para o Asaas', async () => {
    mocks.client.post.mockResolvedValue({
      data: { id: 'cus_1' },
    });

    const resultado = await new AsaasPagamentoGateway().criarCliente({
      nome: 'Prestador Teste',
      email: 'prestador@test.com',
      cpfCnpj: '123.456.789-01',
      telefone: '(11) 99999-9999',
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.gatewayCustomerId).toBe('cus_1');
    expect(mocks.client.post).toHaveBeenCalledWith('/customers', {
      name: 'Prestador Teste',
      email: 'prestador@test.com',
      cpfCnpj: '12345678901',
      mobilePhone: '11999999999',
    });
  });

  it('trata ACTIVE do Asaas como pendente ate confirmacao de pagamento', async () => {
    mocks.client.post.mockResolvedValue({
      data: { id: 'sub_1', customer: 'cus_1', status: 'ACTIVE' },
    });
    mocks.client.get
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              id: 'pay_1',
              invoiceUrl: 'https://asaas.test/invoice',
              bankSlipUrl: null,
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: { payload: '000201', encodedImage: 'base64' },
      });

    const resultado = await new AsaasPagamentoGateway().criarAssinaturaMensal(
      assinaturaInput,
    );

    expect(resultado.sucesso).toBe(true);
    expect(resultado.status).toBe('pendente');
    expect(resultado.gatewaySubscriptionId).toBe('sub_1');
    expect(resultado.invoiceUrl).toContain('asaas.test');
    expect(resultado.pixQrCode?.payload).toBe('000201');
    expect(resultado.mensagem).toContain('Pague a primeira cobranca');
  });

  it('cria assinatura com cartao de credito e envia payload esperado ao Asaas', async () => {
    mocks.client.post.mockResolvedValue({
      data: { id: 'sub_credito', customer: 'cus_1', status: 'ACTIVE' },
    });
    mocks.client.get.mockResolvedValueOnce({ data: { data: [] } });

    const resultado = await new AsaasPagamentoGateway().criarAssinaturaMensal({
      ...assinaturaInput,
      dadosPagamento: dadosPagamentoCredito,
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.status).toBe('pendente');
    expect(resultado.mensagem).toContain('Cartao validado');
    expect(mocks.client.post).toHaveBeenCalledWith(
      '/subscriptions',
      expect.objectContaining({
        billingType: 'CREDIT_CARD',
        creditCard: dadosPagamentoCredito.creditCard,
        creditCardHolderInfo: dadosPagamentoCredito.creditCardHolderInfo,
        remoteIp: '203.0.113.10',
      }),
    );
  });

  it('retorna recusado quando o Asaas nega assinatura com credito', async () => {
    mocks.client.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: [{ description: 'Transacao recusada pelo emissor.' }],
        },
      },
    });

    const resultado = await new AsaasPagamentoGateway().criarAssinaturaMensal({
      ...assinaturaInput,
      dadosPagamento: dadosPagamentoCredito,
    });

    expect(resultado.sucesso).toBe(false);
    expect(resultado.status).toBe('recusado');
    expect(resultado.mensagem).toContain('Transacao recusada');
  });

  it('cria assinatura via checkout Asaas com billingType UNDEFINED para permitir debito na fatura', async () => {
    mocks.client.post.mockResolvedValue({
      data: { id: 'sub_invoice', customer: 'cus_1', status: 'ACTIVE' },
    });
    mocks.client.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'pay_invoice',
            invoiceUrl: 'https://asaas.test/invoice',
            bankSlipUrl: null,
          },
        ],
      },
    });

    const resultado = await new AsaasPagamentoGateway().criarAssinaturaMensal({
      ...assinaturaInput,
      dadosPagamento: { metodoPagamento: 'asaas_invoice' },
    });

    expect(resultado.sucesso).toBe(true);
    expect(resultado.status).toBe('pendente');
    expect(resultado.invoiceUrl).toContain('asaas.test');
    expect(resultado.mensagem).toContain('checkout seguro');
    expect(mocks.client.post).toHaveBeenCalledWith(
      '/subscriptions',
      expect.objectContaining({ billingType: 'UNDEFINED' }),
    );
  });

  it('avisa quando o Asaas ainda nao retornou link ou Pix da primeira cobranca', async () => {
    mocks.client.post.mockResolvedValue({
      data: { id: 'sub_sem_link', customer: 'cus_1', status: 'ACTIVE' },
    });
    mocks.client.get.mockResolvedValueOnce({ data: { data: [] } });

    const resultado = await new AsaasPagamentoGateway().criarAssinaturaMensal(
      assinaturaInput,
    );

    expect(resultado.sucesso).toBe(true);
    expect(resultado.status).toBe('pendente');
    expect(resultado.invoiceUrl).toBeNull();
    expect(resultado.bankSlipUrl).toBeNull();
    expect(resultado.pixQrCode).toBeNull();
    expect(resultado.mensagem).toContain('ainda nao retornou link ou Pix');
  });

  it('consulta assinatura sem transformar ACTIVE em assinatura local ativa', async () => {
    mocks.client.get.mockResolvedValue({
      data: { id: 'sub_1', status: 'ACTIVE' },
    });

    const resultado = await new AsaasPagamentoGateway().consultarAssinatura(
      'sub_1',
    );

    expect(resultado.sucesso).toBe(true);
    expect(resultado.status).toBe('pendente');
  });
});
