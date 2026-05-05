import express from 'express';
import cookieParser from 'cookie-parser';
import { existsSync, readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';
import path from 'path';
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
    cuidadores: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    enfermeiros: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    acompanhantes: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
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
      obterUsuarioAutenticado: vi.fn(),
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
import ServiceOnboarding from '../service/Service_Onboarding';
import CrudRouter from '../route/Route_Crud';
import UserRouter from '../route/Route_User';
import LoginRouter from '../route/Route_Login';
import AgendamentoRouter from '../route/Route_Agendamento';
import AssinaturaRouter from '../route/Route_Assinatura';

function appComRotasPublicas() {
  const app = express();
  app.use(express.json());
  app.post('/login', AuthController.login);
  app.post('/email/confirmar', ControllerConfirmacaoEmail.confirmar as any);
  app.post('/recuperar-senha', RecuperacaoSenhaController.enviarEmail);
  return app;
}

function appComRotasProtegidas() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/crud', CrudRouter);
  app.use('/create-users', UserRouter);
  app.use('/login', LoginRouter);
  app.use('/agendamentos', AgendamentoRouter);
  app.use('/assinaturas', AssinaturaRouter);
  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'healthy' }));
  return app;
}

function tokenTeste(payload: Record<string, unknown>) {
  return sign(
    {
      id: 'u1',
      nome: 'Usuario',
      email: 'u@test.com',
      tipo: 'cliente',
      ...payload,
    },
    process.env.JWT_SECRET || 'segredo-de-teste-com-mais-de-32-caracteres',
    { expiresIn: '1h' },
  );
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

describe('fluxos criticos do produto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ASAAS_WEBHOOK_TOKEN = 'asaas-test-token';
    process.env.JWT_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
  });

  it('bloqueia CRUD generico para usuario anonimo', async () => {
    const response = await request(appComRotasProtegidas()).get('/crud/entities');

    expect(response.status).toBe(401);
  });

  it('bloqueia CRUD generico para usuario nao admin', async () => {
    const response = await request(appComRotasProtegidas())
      .get('/crud/entities')
      .set('Authorization', `Bearer ${tokenTeste({ tipo: 'cliente' })}`);

    expect(response.status).toBe(403);
  });

  it('bloqueia entidade sensivel mesmo para admin no CRUD generico', async () => {
    const response = await request(appComRotasProtegidas())
      .get('/crud/usuarios')
      .set('Authorization', `Bearer ${tokenTeste({ tipo: 'admin' })}`);

    expect(response.status).toBe(403);
  });

  it('admin autenticado acessa rota administrativa permitida', async () => {
    mocks.prisma.$queryRaw.mockResolvedValue([{ TABLE_NAME: 'planos' }]);

    const response = await request(appComRotasProtegidas())
      .get('/crud/entities')
      .set('Authorization', `Bearer ${tokenTeste({ tipo: 'admin' })}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ TABLE_NAME: 'planos' }]);
  });

  it('bloqueia busca de usuario anonima', async () => {
    const response = await request(appComRotasProtegidas()).get(
      '/create-users/usuario/u1',
    );

    expect(response.status).toBe(401);
  });

  it('bloqueia acesso cruzado de usuario comum', async () => {
    const response = await request(appComRotasProtegidas())
      .put('/create-users/usuario/u2')
      .set('Authorization', `Bearer ${tokenTeste({ id: 'u1', tipo: 'cliente' })}`)
      .send({ usuario: { nome: 'Outro' } });

    expect(response.status).toBe(403);
  });

  it('bloqueia cadastro publico de administrador', async () => {
    const response = await request(appComRotasProtegidas())
      .post('/create-users/usuario')
      .send({
        usuario: {
          nome: 'Admin Publico',
          email: 'admin-publico@test.com',
          senha: 'Senha!123',
          telefone: '11999999999',
          cpf: '52998224725',
          cep: '01001000',
          tipo: 'admin',
        },
        admin: {
          cargo: 'Administrador',
          permissao_total: true,
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.erros.tipo).toContain(
      'Tipo de usuario nao permitido no cadastro publico.',
    );
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
    expect(response.body.token).toBeUndefined();
    expect(response.headers['set-cookie']?.join(';')).toContain(
      'zelo_token=jwt',
    );
    expect(response.body.user.senha).toBeUndefined();
  });

  it('login com payload incompleto retorna 400', async () => {
    const response = await request(appComRotasPublicas())
      .post('/login')
      .send({ identificador: 'user@test.com' });

    expect(response.status).toBe(400);
  });

  it('login invalido retorna 401', async () => {
    mocks.authService.login.mockRejectedValue(
      new Error('Usuario ou senha invalidos.'),
    );

    const response = await request(appComRotasPublicas())
      .post('/login')
      .send({ identificador: 'user@test.com', senha: 'errada' });

    expect(response.status).toBe(401);
  });

  it('health check responde status operacional', async () => {
    const response = await request(appComRotasProtegidas()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('/login/me sem sessao retorna 401', async () => {
    const response = await request(appComRotasProtegidas()).get('/login/me');

    expect(response.status).toBe(401);
  });

  it('logout limpa cookie de sessao', async () => {
    const response = await request(appComRotasProtegidas()).post('/login/logout');

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']?.join(';')).toContain('zelo_token=');
  });

  it('criar agendamento sem login retorna 401', async () => {
    const response = await request(appComRotasProtegidas())
      .post('/agendamentos')
      .send({ prestador_id: 'p1' });

    expect(response.status).toBe(401);
  });

  it('listar planos de assinatura sem login retorna 401', async () => {
    const response = await request(appComRotasProtegidas()).get('/assinaturas/planos');

    expect(response.status).toBe(401);
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
    mocks.prisma.usuarios.findUnique
      .mockResolvedValueOnce({
        id: 'prestador-1',
        nome: 'Prestador',
        email: 'pro@test.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'cuidador',
        email_confirmado: true,
      })
      .mockResolvedValueOnce({
        id: 'prestador-1',
        tipo: 'cuidador',
        email_confirmado: true,
        status_cadastro: 'pendente_pagamento',
        cuidadores: {
          bio: 'Bio profissional',
          disponibilidade: 'Dias uteis',
          especialidades: 'Idosos',
        },
        enfermeiros: null,
        acompanhantes: null,
        assinaturas: [],
      });
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Mensal',
      valor: '49.90',
      ativo: true,
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

  it('inicia assinatura com credito sem registrar numero completo ou CVV em eventos', async () => {
    mocks.prisma.usuarios.findUnique
      .mockResolvedValueOnce({
        id: 'prestador-1',
        nome: 'Prestador',
        email: 'pro@test.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'cuidador',
        email_confirmado: true,
      })
      .mockResolvedValueOnce({
        id: 'prestador-1',
        tipo: 'cuidador',
        email_confirmado: true,
        status_cadastro: 'pendente_pagamento',
        cuidadores: {
          bio: 'Bio profissional',
          disponibilidade: 'Dias uteis',
          especialidades: 'Idosos',
        },
        enfermeiros: null,
        acompanhantes: null,
        assinaturas: [],
      });
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Mensal',
      valor: '49.90',
      ativo: true,
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
      gatewaySubscriptionId: 'sub_credito',
      gatewayPaymentId: 'pay_credito',
      mensagem: 'Cartao validado no Asaas.',
    });
    mocks.prisma.assinaturas.create.mockResolvedValue({
      ...assinaturaBase,
      gateway_subscription_id: 'sub_credito',
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 10 });

    await ServiceAssinatura.iniciarOuRegularizarAssinatura(
      'prestador-1',
      1,
      dadosPagamentoCredito,
    );

    expect(mocks.gateway.criarAssinaturaMensal).toHaveBeenCalledWith(
      expect.objectContaining({
        dadosPagamento: expect.objectContaining({
          metodoPagamento: 'credit_card',
          creditCard: dadosPagamentoCredito.creditCard,
          creditCardHolderInfo: dadosPagamentoCredito.creditCardHolderInfo,
          remoteIp: '203.0.113.10',
        }),
      }),
    );

    const eventosSerializados = JSON.stringify(
      mocks.prisma.eventos_assinatura.create.mock.calls,
    );
    expect(eventosSerializados).not.toContain('5162306219378829');
    expect(eventosSerializados).not.toContain('318');
    expect(eventosSerializados).toContain('credit_card');
  });

  it('marca assinatura como falhou quando credito e recusado', async () => {
    mocks.prisma.usuarios.findUnique
      .mockResolvedValueOnce({
        id: 'prestador-1',
        nome: 'Prestador',
        email: 'pro@test.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'cuidador',
        email_confirmado: true,
      })
      .mockResolvedValueOnce({
        id: 'prestador-1',
        tipo: 'cuidador',
        email_confirmado: true,
        status_cadastro: 'pendente_pagamento',
        cuidadores: {
          bio: 'Bio profissional',
          disponibilidade: 'Dias uteis',
          especialidades: 'Idosos',
        },
        enfermeiros: null,
        acompanhantes: null,
        assinaturas: [],
      });
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Mensal',
      valor: '49.90',
      ativo: true,
    });
    mocks.prisma.assinaturas.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mocks.gateway.criarCliente.mockResolvedValue({
      sucesso: true,
      gateway: 'asaas',
      gatewayCustomerId: 'cus_1',
    });
    mocks.gateway.criarAssinaturaMensal.mockResolvedValue({
      sucesso: false,
      status: 'recusado',
      gateway: 'asaas',
      gatewayCustomerId: 'cus_1',
      mensagem: 'Transacao recusada pelo emissor.',
    });
    mocks.prisma.assinaturas.create.mockResolvedValue({
      ...assinaturaBase,
      status: 'falhou',
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 11 });

    const resultado = await ServiceAssinatura.iniciarOuRegularizarAssinatura(
      'prestador-1',
      1,
      dadosPagamentoCredito,
    );

    expect(resultado.gateway_resultado.status).toBe('recusado');
    expect(resultado.assinatura.status).toBe('falhou');
  });

  it('bloqueia debito direto antes de chamar gateway de assinatura', async () => {
    await expect(
      ServiceAssinatura.iniciarOuRegularizarAssinatura('prestador-1', 1, {
        metodoPagamento: 'debit_card',
      } as any),
    ).rejects.toMatchObject({ status: 400 });
    expect(mocks.gateway.criarAssinaturaMensal).not.toHaveBeenCalled();
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

  it('ignora webhook duplicado sem alterar assinatura novamente', async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue({
      id: 99,
      tipo: 'pagamento_confirmado',
      criado_em: new Date(),
    });

    const resultado = await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_duplicado',
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'pay_duplicado',
          subscription: 'sub_1',
          status: 'CONFIRMED',
        },
      },
    });

    expect(resultado).toMatchObject({
      processado: true,
      idempotente: true,
      motivo: 'evento_repetido',
      evento_assinatura_id: 99,
    });
    expect(mocks.prisma.eventos_assinatura.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: 'webhook_evento_duplicado_ignorado',
          gateway_event_id: null,
        }),
      }),
    );
    expect(mocks.prisma.assinaturas.update).not.toHaveBeenCalled();
    expect(mocks.prisma.usuarios.update).not.toHaveBeenCalled();
  });

  it('processa webhook PAYMENT_RECEIVED como confirmacao financeira', async () => {
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
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 4 });

    const resultado = await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_received',
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_received',
          subscription: 'sub_1',
          customer: 'cus_1',
          status: 'RECEIVED',
          paymentDate: '2026-05-02',
          dueDate: '2026-06-02',
        },
      },
    });

    expect(resultado.processado).toBe(true);
    expect(mocks.prisma.eventos_assinatura.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: 'pagamento_confirmado',
          status_anterior: 'aguardando_confirmacao',
          status_novo: 'ativa',
        }),
      }),
    );
  });

  it('processa cancelamento de assinatura pelo Asaas', async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue(null);
    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      ...assinaturaBase,
      status: 'ativa',
    });
    mocks.prisma.assinaturas.update.mockResolvedValue({
      ...assinaturaBase,
      status: 'cancelada',
    });
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      email_confirmado: true,
    });
    mocks.prisma.usuarios.update.mockResolvedValue({});
    mocks.prisma.logs_acao.create.mockResolvedValue({});
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 5 });

    const resultado = await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_cancelada',
        event: 'SUBSCRIPTION_CANCELLED',
        subscription: {
          id: 'sub_1',
          customer: 'cus_1',
          status: 'CANCELLED',
        },
      },
    });

    expect(resultado.processado).toBe(true);
    expect(mocks.prisma.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status_cadastro: 'cancelado' } }),
    );
  });

  it('ignora evento antigo sem sobrescrever pagamento mais recente', async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue(null);
    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      ...assinaturaBase,
      status: 'ativa',
      data_ultimo_pagamento: new Date('2026-05-20T00:00:00Z'),
    });
    mocks.prisma.eventos_assinatura.create.mockResolvedValue({ id: 3 });

    const resultado = await ServiceAssinatura.processarWebhookAsaas({
      token: 'asaas-test-token',
      payload: {
        id: 'evt_antigo',
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'pay_antigo',
          subscription: 'sub_1',
          status: 'OVERDUE',
          dueDate: '2026-05-01',
        },
      },
    });

    expect(resultado).toMatchObject({
      processado: false,
      motivo: 'evento_antigo_ignorado',
    });
    expect(mocks.prisma.assinaturas.update).not.toHaveBeenCalled();
  });

  it('nao permite iniciar assinatura com plano inativo', async () => {
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
      id: 2,
      nome: 'Inativo',
      valor: '49.90',
      ativo: false,
    });

    await expect(
      ServiceAssinatura.iniciarOuRegularizarAssinatura('prestador-1', 2),
    ).rejects.toMatchObject({ status: 404 });
    expect(mocks.gateway.criarAssinaturaMensal).not.toHaveBeenCalled();
  });

  it('cliente cadastrado nao precisa de assinatura para concluir onboarding', async () => {
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      id: 'cliente-1',
      tipo: 'cliente',
      email_confirmado: true,
      status_cadastro: 'ativo',
      cuidadores: null,
      enfermeiros: null,
      acompanhantes: null,
      assinaturas: [],
    });

    const status = await ServiceOnboarding.obterStatus('cliente-1');

    expect(status).toMatchObject({
      isPrestador: false,
      etapaAtual: 'ativo',
      perfilProfissionalAtivo: true,
    });
  });

  it('prestador cadastrado inicia pendente de confirmacao de email', async () => {
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      id: 'prestador-1',
      tipo: 'cuidador',
      email_confirmado: false,
      status_cadastro: 'pendente_pagamento',
      cuidadores: null,
      enfermeiros: null,
      acompanhantes: null,
      assinaturas: [],
    });

    const status = await ServiceOnboarding.obterStatus('prestador-1');

    expect(status).toMatchObject({
      isPrestador: true,
      etapaAtual: 'confirmar_email',
      perfilProfissionalAtivo: false,
      podeAparecerNaBusca: false,
    });
  });

  it('GET /onboarding/status identifica etapa de escolher plano', async () => {
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      id: 'prestador-1',
      tipo: 'cuidador',
      email_confirmado: true,
      status_cadastro: 'pendente_pagamento',
      cuidadores: {
        bio: 'Bio profissional',
        disponibilidade: 'Dias uteis',
        especialidades: 'Idosos',
      },
      enfermeiros: null,
      acompanhantes: null,
      assinaturas: [],
    });

    const status = await ServiceOnboarding.obterStatus('prestador-1');

    expect(status).toMatchObject({
      etapaAtual: 'escolher_plano',
      possuiDadosProfissionais: true,
      possuiAssinatura: false,
      proximaAcao: expect.stringContaining('Escolha um plano'),
    });
  });

  it('prestador sem e-mail confirmado nao inicia pagamento', async () => {
    mocks.prisma.usuarios.findUnique
      .mockResolvedValueOnce({
        id: 'prestador-1',
        nome: 'Prestador',
        email: 'pro@test.com',
        cpf: '12345678901',
        telefone: '11999999999',
        tipo: 'cuidador',
        email_confirmado: false,
      })
      .mockResolvedValueOnce({
        id: 'prestador-1',
        tipo: 'cuidador',
        email_confirmado: false,
        status_cadastro: 'pendente_pagamento',
        cuidadores: null,
        enfermeiros: null,
        acompanhantes: null,
        assinaturas: [],
      });
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      nome: 'Mensal',
      valor: '49.90',
      ativo: true,
    });

    await expect(
      ServiceAssinatura.iniciarOuRegularizarAssinatura('prestador-1', 1),
    ).rejects.toMatchObject({ status: 403 });
    expect(mocks.gateway.criarAssinaturaMensal).not.toHaveBeenCalled();
  });

  it('prestador ativo pode aparecer na busca e inativo nao pode', async () => {
    mocks.prisma.usuarios.findUnique.mockReset();
    mocks.prisma.assinaturas.findFirst.mockReset();
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

  it('migration de eventos financeiros contem hash e data de processamento', () => {
    const migrationPath = path.resolve(
      process.cwd(),
      'prisma/migrations/20260502170000_add_hash_to_eventos_assinatura/migration.sql',
    );

    expect(existsSync(migrationPath)).toBe(true);
    const sql = readFileSync(migrationPath, 'utf8');
    expect(sql).toContain('payload_hash');
    expect(sql).toContain('processado_em');
  });
});
