import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const prisma: any = {
    planos: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    usuarios: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    assinaturas: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    eventos_assinatura: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    logs_acao: {
      create: vi.fn(),
    },
    servicos: {
      findFirst: vi.fn(),
    },
    contratacoes: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation((callback: any) => callback(prisma));

  return {
    prisma,
    gateway: {
      criarCliente: vi.fn(),
      criarAssinaturaMensal: vi.fn(),
      cancelarAssinatura: vi.fn(),
      consultarAssinatura: vi.fn(),
    },
    authService: {
      login: vi.fn(),
      iniciarLoginSocial: vi.fn(),
      concluirCallbackSocial: vi.fn(),
      completarCadastroSocial: vi.fn(),
    },
    confirmacaoEmailService: {
      confirmarEmail: vi.fn(),
      reenviarConfirmacao: vi.fn(),
      obterStatusEmail: vi.fn(),
    },
    recuperacaoSenhaService: {
      enviarEmailRecuperacao: vi.fn(),
      validarTokenRecuperacao: vi.fn(),
      redefinirSenha: vi.fn(),
    },
  };
});

vi.mock('../lib/prisma', () => ({ default: mocks.prisma }));
vi.mock('../gateways/pagamento', () => ({
  obterPagamentoGateway: () => mocks.gateway,
}));
vi.mock('../service/Service_Autenticacao', () => ({
  ServiceAuth: mocks.authService,
  default: mocks.authService,
}));
vi.mock('../service/Service_ConfirmacaoEmail', () => ({
  default: mocks.confirmacaoEmailService,
}));
vi.mock('../service/Service_RecuperacaoSenha', () => ({
  default: mocks.recuperacaoSenhaService,
}));
vi.mock('../service/Service_Email', () => ({
  default: class EmailService {
    send = vi.fn().mockResolvedValue(true);
  },
}));

import { AuthController } from '../controller/Controller_Login';
import ControllerConfirmacaoEmail from '../controller/Controller_ConfirmacaoEmail';
import RecuperacaoSenhaController from '../controller/Controller_RecuperacaoSenha';
import ServiceAgendamento from '../service/Service_Agendamento';
import ServiceAssinatura from '../service/Service_Assinatura';

function appComRotasPublicas() {
  const app = express();
  app.use(express.json());
  app.post('/login', AuthController.login);
  app.post('/email/confirmar', ControllerConfirmacaoEmail.confirmar as any);
  app.post('/recuperar-senha', RecuperacaoSenhaController.enviarEmail);
  return app;
}

const assinaturaBase = {
  id: 10,
  prestador_id: 'prestador-1',
  plano_id: 1,
  status: 'aguardando_confirmacao',
  gateway: 'asaas',
  gateway_customer_id: 'cus_1',
  gateway_subscription_id: 'sub_1',
  gateway_status: 'PENDING',
  data_ultimo_pagamento: null,
  data_proximo_vencimento: null,
  periodo_tolerancia_ate: null,
  confirmacao_expira_em: new Date(),
  cancelada_em: null,
  criado_em: new Date(),
  atualizado_em: new Date(),
};

describe('fluxos criticos do produto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ASAAS_WEBHOOK_TOKEN = 'asaas-test-token';
  });

  it('realiza login sem expor senha no retorno', async () => {
    mocks.authService.login.mockResolvedValue({
      token: 'jwt',
      user: { id: 'u1', email: 'user@test.com', tipo: 'cliente' },
    });

    const response = await request(appComRotasPublicas())
      .post('/login')
      .send({ identificador: 'user@test.com', senha: 'Senha!123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('jwt');
    expect(response.body.user.senha).toBeUndefined();
  });

  it('confirma e-mail por token', async () => {
    mocks.confirmacaoEmailService.confirmarEmail.mockResolvedValue({
      message: 'E-mail confirmado com sucesso.',
    });

    const response = await request(appComRotasPublicas())
      .post('/email/confirmar')
      .send({ token: 'token-email' });

    expect(response.status).toBe(200);
    expect(mocks.confirmacaoEmailService.confirmarEmail).toHaveBeenCalledWith(
      'token-email',
    );
  });

  it('solicita recuperacao de senha', async () => {
    mocks.recuperacaoSenhaService.enviarEmailRecuperacao.mockResolvedValue({
      message: 'Se este e-mail estiver cadastrado, enviaremos instrucoes.',
    });

    const response = await request(appComRotasPublicas())
      .post('/recuperar-senha')
      .send({ email: 'user@test.com' });

    expect(response.status).toBe(200);
    expect(
      mocks.recuperacaoSenhaService.enviarEmailRecuperacao,
    ).toHaveBeenCalledWith('user@test.com');
  });

  it('lista apenas planos ativos e pagos', async () => {
    mocks.prisma.planos.findMany.mockResolvedValue([
      { id: 1, nome: 'Mensal', descricao: null, valor: '49.90', beneficios: null },
    ]);

    const planos = await ServiceAssinatura.listarPlanosDisponiveis();

    expect(mocks.prisma.planos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ativo: true, valor: { gt: 0 } },
        orderBy: [{ ordem: 'asc' }, { id: 'asc' }],
      }),
    );
    expect(planos[0].valor).toBe(49.9);
  });

  it('inicia assinatura criando cobranca no gateway', async () => {
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      id: 'prestador-1',
      nome: 'Prestador',
      email: 'pro@test.com',
      cpf: '12345678901',
      telefone: '11999999999',
      tipo: 'cuidador',
      email_confirmado: true,
    });
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Mensal',
      valor: '49.90',
    });
    mocks.prisma.assinaturas.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mocks.gateway.criarCliente.mockResolvedValue({
      sucesso: true,
      gateway: 'asaas',
      gatewayCustomerId: 'cus_1',
    });
    mocks.gateway.criarAssinaturaMensal.mockResolvedValue({
      sucesso: true,
      status: 'pendente',
      gateway: 'asaas',
      gatewayCustomerId: 'cus_1',
      gatewaySubscriptionId: 'sub_1',
      gatewayPaymentId: 'pay_1',
      invoiceUrl: 'https://asaas.test/invoice',
    });
    mocks.prisma.assinaturas.create.mockResolvedValue({
      ...assinaturaBase,
      gateway_subscription_id: 'sub_1',
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 1 });

    const resultado = await ServiceAssinatura.iniciarOuRegularizarAssinatura(
      'prestador-1',
      1,
    );

    expect(mocks.gateway.criarAssinaturaMensal).toHaveBeenCalled();
    expect(resultado.gateway_resultado.invoiceUrl).toContain('asaas.test');
    expect(mocks.prisma.eventos_assinatura.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tipo: 'assinatura_criada' }),
      }),
    );
  });

  it('processa webhook PAYMENT_CONFIRMED e ativa prestador', async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue(null);
    mocks.prisma.assinaturas.findFirst.mockResolvedValue(assinaturaBase);
    mocks.prisma.assinaturas.update.mockResolvedValue({
      ...assinaturaBase,
      status: 'ativa',
    });
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      email_confirmado: true,
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.logs_acao.create.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 1 });

    const resultado = await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_1',
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_1',
          subscription: 'sub_1',
          customer: 'cus_1',
          status: 'CONFIRMED',
          confirmedDate: '2026-05-02',
          dueDate: '2026-06-02',
        },
      },
    });

    expect(resultado.processado).toBe(true);
    expect(mocks.prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status_cadastro: 'ativo' } }),
    );
  });

  it('processa webhook PAYMENT_OVERDUE e remove prestador da busca', async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue(null);
    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      ...assinaturaBase,
      status: 'ativa',
    });
    mocks.prisma.assinaturas.update.mockResolvedValue({
      ...assinaturaBase,
      status: 'atrasada',
    });
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      email_confirmado: true,
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.logs_acao.create.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 2 });

    await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_2',
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'pay_2',
          subscription: 'sub_1',
          customer: 'cus_1',
          status: 'OVERDUE',
          dueDate: '2026-05-01',
        },
      },
    });

    expect(mocks.prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status_cadastro: 'inadimplente' } }),
    );
  });

  it('prestador ativo pode aparecer na busca e inativo nao pode', async () => {
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      id: 'prestador-1',
      tipo: 'cuidador',
      email_confirmado: true,
      status_cadastro: 'ativo',
    });
    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      ...assinaturaBase,
      status: 'ativa',
    });

    await expect(
      ServiceAssinatura.prestadorPodeAparecerNaBusca('prestador-1'),
    ).resolves.toBe(true);

    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      ...assinaturaBase,
      status: 'atrasada',
    });

    await expect(
      ServiceAssinatura.prestadorPodeAparecerNaBusca('prestador-1'),
    ).resolves.toBe(false);
  });

  it('agendamento bloqueia prestador sem assinatura ativa', async () => {
    mocks.prisma.usuarios.findUnique
      .mockResolvedValueOnce({ id: 'cliente-1', email_confirmado: true })
      .mockResolvedValueOnce({
        id: 'prestador-1',
        nome: 'Prestador',
        email: 'pro@test.com',
        tipo: 'cuidador',
        email_confirmado: true,
      });
    vi.spyOn(ServiceAssinatura, 'prestadorPodeReceberPedidos').mockResolvedValue(
      false,
    );

    await expect(
      ServiceAgendamento.criarAgendamento(
        {
          prestador_id: 'prestador-1',
          servico_id: 1,
          data: '2026-05-10',
          hora_inicio: '10:00',
        },
        { id: 'cliente-1', tipo: 'cliente' },
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
});

