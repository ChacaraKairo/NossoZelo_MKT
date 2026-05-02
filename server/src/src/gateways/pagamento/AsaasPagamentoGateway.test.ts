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
