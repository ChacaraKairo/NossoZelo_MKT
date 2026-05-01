import { assinaturas_status, Prisma, usuarios_status_cadastro } from '@prisma/client';
import {
  DIAS_TOLERANCIA_ASSINATURA,
  GATEWAY_PAGAMENTO,
  HORAS_CONFIRMACAO_PAGAMENTO,
  STATUS_ASSINATURA,
  STATUS_CADASTRO_USUARIO,
} from '../constants/financeiro';
import { TIPOS_PRESTADOR } from '../constants/dominio';
import { obterPagamentoGateway } from '../gateways/pagamento';
import { CriarAssinaturaResultado } from '../gateways/pagamento/PagamentoGateway';
import logger from '../lib/logger';
import prisma from '../lib/prisma';

type DadosGatewayAtivacao = Partial<CriarAssinaturaResultado> & {
  gatewaySubscriptionId?: string;
  gatewayCustomerId?: string;
  planoId?: number;
};

type MetodoPagamentoAssinatura = 'credito' | 'debito';

type CartaoResumoAssinatura = {
  nomeTitular: string;
  cpfTitular: string;
  numeroFinal: string;
  validadeMes: string;
  validadeAno: string;
  bandeira?: string;
};

export type DadosPagamentoAssinatura = {
  metodoPagamento?: MetodoPagamentoAssinatura;
  cartaoToken?: string;
  cartaoResumo?: CartaoResumoAssinatura;
};

type WebhookAsaasInput = {
  token?: string;
  payload: unknown;
};

type AsaasWebhookPayload = {
  event?: string;
  payment?: {
    id?: string;
    customer?: string;
    subscription?: string;
    status?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
    confirmedDate?: string;
    dueDate?: string;
    invoiceUrl?: string;
  };
  subscription?: {
    id?: string;
    customer?: string;
    status?: string;
    nextDueDate?: string;
    dateCreated?: string;
  };
};

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

function valorAssinaturaMensal(valorPlano: Prisma.Decimal | number | string) {
  const valorConfigurado = Number(process.env.ASSINATURA_VALOR ?? 0.01);
  if (Number.isFinite(valorConfigurado) && valorConfigurado > 0) {
    return valorConfigurado;
  }

  return Number(valorPlano);
}

async function obterOuCriarPlanoAssinatura(planoId: number) {
  const planoInformado = await prisma.planos.findUnique({
    where: { id: planoId },
  });

  if (planoInformado) return planoInformado;

  const primeiroPlano = await prisma.planos.findFirst({
    orderBy: { id: 'asc' },
  });

  if (primeiroPlano) return primeiroPlano;

  return prisma.planos.create({
    data: {
      nome: 'Assinatura Profissional Mensal',
      valor: 0.01,
      beneficios:
        'Plano mensal para ativacao de prestadores profissionais.',
    },
  });
}

function statusCadastroPorAssinatura(
  status: assinaturas_status,
): usuarios_status_cadastro {
  if (status === STATUS_ASSINATURA.ativa) {
    return STATUS_CADASTRO_USUARIO.ativo;
  }

  if (status === STATUS_ASSINATURA.aguardando_confirmacao) {
    return STATUS_CADASTRO_USUARIO.aguardando_confirmacao_pagamento;
  }

  if (status === STATUS_ASSINATURA.bloqueada) {
    return STATUS_CADASTRO_USUARIO.bloqueado;
  }

  if (status === STATUS_ASSINATURA.cancelada) {
    return STATUS_CADASTRO_USUARIO.cancelado;
  }

  if (
    status === STATUS_ASSINATURA.falhou ||
    status === STATUS_ASSINATURA.expirada ||
    status === STATUS_ASSINATURA.atrasada
  ) {
    return STATUS_CADASTRO_USUARIO.inadimplente;
  }

  return STATUS_CADASTRO_USUARIO.pendente_pagamento;
}

function motivoPerfilInativo(status?: assinaturas_status | null) {
  if (status === STATUS_ASSINATURA.aguardando_confirmacao) {
    return 'pagamento_aguardando_confirmacao';
  }
  if (status === STATUS_ASSINATURA.falhou) return 'assinatura_falhou';
  if (status === STATUS_ASSINATURA.expirada) return 'assinatura_expirada';
  if (status === STATUS_ASSINATURA.bloqueada) return 'assinatura_bloqueada';
  if (status === STATUS_ASSINATURA.cancelada) return 'assinatura_cancelada';
  return 'pagamento_pendente';
}

function payloadAsaas(payload: unknown): AsaasWebhookPayload {
  if (!payload || typeof payload !== 'object') {
    throw erroNegocio('Payload do webhook Asaas invalido.', 400);
  }

  return payload as AsaasWebhookPayload;
}

function dataAsaas(valor?: string | null) {
  if (!valor) return undefined;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return undefined;
  return data;
}

function limitarGatewayStatus(valor: string) {
  return valor.slice(0, 60);
}

function validarDadosPagamentoAssinatura(
  dadosPagamento?: DadosPagamentoAssinatura,
) {
  if (!dadosPagamento) return null;

  if (dadosPagamento.metodoPagamento) {
    const metodoValido =
      dadosPagamento.metodoPagamento === 'credito' ||
      dadosPagamento.metodoPagamento === 'debito';
    if (!metodoValido) {
      throw erroNegocio('Metodo de pagamento invalido.', 400);
    }
  }

  const resumo = dadosPagamento.cartaoResumo;
  if (!resumo) {
    throw erroNegocio('Resumo do cartao e obrigatorio.', 400);
  }

  if (!resumo.nomeTitular?.trim()) {
    throw erroNegocio('Nome do titular e obrigatorio.', 400);
  }

  if (!/^\d{4}$/.test(resumo.numeroFinal)) {
    throw erroNegocio('Final do cartao invalido.', 400);
  }

  if (!/^\d{2}$/.test(resumo.validadeMes)) {
    throw erroNegocio('Mes de validade invalido.', 400);
  }

  if (!/^\d{2,4}$/.test(resumo.validadeAno)) {
    throw erroNegocio('Ano de validade invalido.', 400);
  }

  return {
    recebido: true,
    metodoPagamento: dadosPagamento.metodoPagamento,
    cartaoResumo: resumo,
  };
}

export class ServiceAssinatura {
  static calcularConfirmacaoExpiraEm() {
    const data = new Date();
    data.setHours(data.getHours() + HORAS_CONFIRMACAO_PAGAMENTO);
    return data;
  }

  static async obterAssinaturaAtual(prestadorId: string) {
    return prisma.assinaturas.findFirst({
      where: { prestador_id: prestadorId },
      orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
    });
  }

  static async obterStatusAssinaturaPrestador(prestadorId: string) {
    const [usuario, assinaturaAtual] = await Promise.all([
      prisma.usuarios.findUnique({
        where: { id: prestadorId },
        select: {
          id: true,
          tipo: true,
          email_confirmado: true,
          status_cadastro: true,
        },
      }),
      this.obterAssinaturaAtual(prestadorId),
    ]);

    if (!usuario) {
      throw erroNegocio('Prestador nao encontrado.', 404);
    }

    if (!TIPOS_PRESTADOR.includes(usuario.tipo as any)) {
      throw erroNegocio('Usuario informado nao e um prestador.', 400);
    }

    const assinaturaStatus =
      assinaturaAtual?.status ?? STATUS_ASSINATURA.pendente;
    const perfilProfissionalAtivo =
      usuario.email_confirmado &&
      usuario.status_cadastro === STATUS_CADASTRO_USUARIO.ativo &&
      assinaturaStatus === STATUS_ASSINATURA.ativa;

    return {
      prestador_id: prestadorId,
      status_cadastro: usuario.status_cadastro,
      assinatura_atual: assinaturaAtual,
      assinatura_status: assinaturaStatus,
      assinatura_confirmacao_expira_em:
        assinaturaAtual?.confirmacao_expira_em ?? null,
      perfil_profissional_ativo: perfilProfissionalAtivo,
      pode_aparecer_na_busca: perfilProfissionalAtivo,
      pode_receber_pedidos: perfilProfissionalAtivo,
      motivo_perfil_inativo: perfilProfissionalAtivo
        ? null
        : usuario.email_confirmado
          ? motivoPerfilInativo(assinaturaAtual?.status)
          : 'email_nao_confirmado',
    };
  }

  static async prestadorPodeAparecerNaBusca(prestadorId: string) {
    const status =
      await this.obterStatusAssinaturaPrestador(prestadorId);
    return status.pode_aparecer_na_busca;
  }

  static async prestadorPodeReceberPedidos(prestadorId: string) {
    const status =
      await this.obterStatusAssinaturaPrestador(prestadorId);
    return status.pode_receber_pedidos;
  }

  static async prestadorPodeUsarPerfilProfissional(prestadorId: string) {
    const status =
      await this.obterStatusAssinaturaPrestador(prestadorId);
    return status.perfil_profissional_ativo;
  }

  static async criarAssinaturaAguardandoConfirmacao(
    prestadorId: string,
    planoId: number,
  ) {
    const confirmacaoExpiraEm = this.calcularConfirmacaoExpiraEm();

    const assinatura = await prisma.assinaturas.create({
      data: {
        prestador_id: prestadorId,
        plano_id: planoId,
        status: STATUS_ASSINATURA.aguardando_confirmacao,
        gateway: GATEWAY_PAGAMENTO.asaas,
        confirmacao_expira_em: confirmacaoExpiraEm,
      },
    });

    await prisma.usuarios.update({
      where: { id: prestadorId },
      data: {
        status_cadastro:
          STATUS_CADASTRO_USUARIO.aguardando_confirmacao_pagamento,
      },
    });

    return assinatura;
  }

  static async iniciarOuRegularizarAssinatura(
    prestadorId: string,
    planoId: number,
    dadosPagamento?: DadosPagamentoAssinatura,
  ) {
    const dadosValidados = validarDadosPagamentoAssinatura(dadosPagamento);
    const [usuario, plano] = await Promise.all([
      prisma.usuarios.findUnique({
        where: { id: prestadorId },
        select: {
          id: true,
          nome: true,
          email: true,
          cpf: true,
          telefone: true,
          tipo: true,
          email_confirmado: true,
        },
      }),
      obterOuCriarPlanoAssinatura(planoId),
    ]);

    if (!usuario) throw erroNegocio('Prestador nao encontrado.', 404);
    if (!TIPOS_PRESTADOR.includes(usuario.tipo as any)) {
      throw erroNegocio('Cliente nao pode iniciar assinatura.', 403);
    }
    if (!usuario.email_confirmado) {
      throw erroNegocio(
        'Confirme seu e-mail antes de iniciar a assinatura.',
        403,
      );
    }

    const assinaturaAtual = await this.obterAssinaturaAtual(prestadorId);
    const gateway = obterPagamentoGateway();
    const clienteGateway = await gateway.criarCliente({
      nome: usuario.nome,
      email: usuario.email,
      cpfCnpj: usuario.cpf,
      telefone: usuario.telefone,
    });

    const resultado = await gateway.criarAssinaturaMensal({
      prestadorId,
      planoId,
      valor: valorAssinaturaMensal(plano.valor),
      nome: usuario.nome,
      email: usuario.email,
      cpfCnpj: usuario.cpf,
      telefone: usuario.telefone,
      gatewayCustomerId: clienteGateway.gatewayCustomerId,
      metodoPagamento: dadosPagamento?.metodoPagamento,
      cartaoToken: dadosPagamento?.cartaoToken,
    });

    if (resultado.status === 'aprovado') {
      const assinatura = await this.ativarAssinatura(prestadorId, {
        ...resultado,
      planoId,
      });
      return {
        gateway_resultado: {
          ...resultado,
          mensagem: 'Assinatura ativada com sucesso.',
        },
        assinatura,
      };
    }

    if (resultado.status === 'recusado') {
      const assinatura = await this.marcarAssinaturaFalhou(
        prestadorId,
        resultado.mensagem || 'Pagamento recusado.',
        planoId,
      );
      return {
        gateway_resultado: resultado,
        assinatura,
      };
    }

    const confirmacaoExpiraEm =
      resultado.confirmacaoExpiraEm || this.calcularConfirmacaoExpiraEm();

    const dadosAssinatura = {
      prestador_id: prestadorId,
      plano_id: planoId,
      status: STATUS_ASSINATURA.aguardando_confirmacao,
      gateway: resultado.gateway,
      gateway_customer_id: resultado.gatewayCustomerId,
      gateway_subscription_id: resultado.gatewaySubscriptionId,
      gateway_status: resultado.status,
      confirmacao_expira_em: confirmacaoExpiraEm,
    };

    const assinatura = await prisma.$transaction(async (tx) => {
      const novaAssinatura = assinaturaAtual
        ? await tx.assinaturas.update({
            where: { id: assinaturaAtual.id },
            data: dadosAssinatura,
          })
        : await tx.assinaturas.create({ data: dadosAssinatura });

      await tx.usuarios.update({
        where: { id: prestadorId },
        data: {
          status_cadastro:
            STATUS_CADASTRO_USUARIO.aguardando_confirmacao_pagamento,
        },
      });

      return novaAssinatura;
    });

    return {
      gateway_resultado: {
        ...resultado,
        mensagem:
          resultado.mensagem ||
          'Pagamento enviado para analise. A confirmacao pode levar ate 72 horas.',
      },
      assinatura,
      ...(dadosValidados ? { pagamento: dadosValidados } : {}),
    };
  }

  static async ativarAssinatura(
    prestadorId: string,
    dadosGateway: DadosGatewayAtivacao,
  ) {
    const assinaturaAtual = await this.obterAssinaturaAtual(prestadorId);
    const agora = new Date();
    const dataProximoVencimento = adicionarDias(agora, 30);

    const dados: Prisma.assinaturasUncheckedCreateInput = {
      prestador_id: prestadorId,
      plano_id: dadosGateway.planoId || assinaturaAtual?.plano_id || 1,
      status: STATUS_ASSINATURA.ativa,
      gateway: dadosGateway.gateway || GATEWAY_PAGAMENTO.asaas,
      gateway_customer_id: dadosGateway.gatewayCustomerId,
      gateway_subscription_id: dadosGateway.gatewaySubscriptionId,
      gateway_status: dadosGateway.status || 'aprovado',
      data_ultimo_pagamento: agora,
      data_proximo_vencimento: dataProximoVencimento,
      periodo_tolerancia_ate: adicionarDias(
        dataProximoVencimento,
        DIAS_TOLERANCIA_ASSINATURA,
      ),
      confirmacao_expira_em: null,
    };

    return prisma.$transaction(async (tx) => {
      const assinatura = assinaturaAtual
        ? await tx.assinaturas.update({
            where: { id: assinaturaAtual.id },
            data: dados,
          })
        : await tx.assinaturas.create({ data: dados });

      await tx.usuarios.update({
        where: { id: prestadorId },
        data: { status_cadastro: STATUS_CADASTRO_USUARIO.ativo },
      });

      return assinatura;
    });
  }

  static async marcarAssinaturaFalhou(
    prestadorId: string,
    motivo: string,
    planoId?: number,
  ) {
    const assinaturaAtual = await this.obterAssinaturaAtual(prestadorId);
    const dados = {
      status: STATUS_ASSINATURA.falhou,
      gateway_status: motivo,
      confirmacao_expira_em: null,
    };

    return prisma.$transaction(async (tx) => {
      const assinatura = assinaturaAtual
        ? await tx.assinaturas.update({
            where: { id: assinaturaAtual.id },
            data: dados,
          })
        : await tx.assinaturas.create({
            data: {
              prestador_id: prestadorId,
              plano_id: planoId || 1,
              gateway: GATEWAY_PAGAMENTO.asaas,
              ...dados,
            },
          });

      await tx.usuarios.update({
        where: { id: prestadorId },
        data: { status_cadastro: STATUS_CADASTRO_USUARIO.inadimplente },
      });

      return assinatura;
    });
  }

  static async cancelarAssinaturaPrestador(prestadorId: string) {
    const assinaturaAtual = await this.obterAssinaturaAtual(prestadorId);

    if (!assinaturaAtual) {
      throw erroNegocio('Assinatura nao encontrada.', 404);
    }

    const gateway = obterPagamentoGateway();
    let gatewayStatus = 'cancelada_localmente';

    if (assinaturaAtual.gateway_subscription_id) {
      const resultadoGateway = await gateway.cancelarAssinatura(
        assinaturaAtual.gateway_subscription_id,
      );
      gatewayStatus =
        resultadoGateway.mensagem || resultadoGateway.status || gatewayStatus;
    }

    return prisma.$transaction(async (tx) => {
      const assinatura = await tx.assinaturas.update({
        where: { id: assinaturaAtual.id },
        data: {
          status: STATUS_ASSINATURA.cancelada,
          gateway_status: gatewayStatus,
          cancelada_em: new Date(),
          confirmacao_expira_em: null,
        },
      });

      await tx.usuarios.update({
        where: { id: prestadorId },
        data: { status_cadastro: STATUS_CADASTRO_USUARIO.cancelado },
      });

      return assinatura;
    });
  }

  static async expirarAssinaturasSemConfirmacao() {
    const agora = new Date();
    const pendentes = await prisma.assinaturas.findMany({
      where: {
        status: STATUS_ASSINATURA.aguardando_confirmacao,
        confirmacao_expira_em: { lt: agora },
      },
      select: { id: true, prestador_id: true },
    });

    if (!pendentes.length) {
      return { expiradas: 0 };
    }

    await prisma.$transaction(async (tx) => {
      await tx.assinaturas.updateMany({
        where: { id: { in: pendentes.map((item) => item.id) } },
        data: {
          status: STATUS_ASSINATURA.expirada,
          gateway_status: 'confirmacao_expirada',
        },
      });

      await tx.usuarios.updateMany({
        where: {
          id: { in: pendentes.map((item) => item.prestador_id) },
        },
        data: {
          status_cadastro: STATUS_CADASTRO_USUARIO.pendente_pagamento,
        },
      });
    });

    return { expiradas: pendentes.length };
  }

  static async verificarAssinaturasVencidas() {
    const agora = new Date();
    const vencidas = await prisma.assinaturas.findMany({
      where: {
        status: STATUS_ASSINATURA.ativa,
        data_proximo_vencimento: { lt: agora },
      },
      select: { id: true, prestador_id: true },
    });

    const idsVencidas = vencidas.map((item) => item.id);
    const bloqueadas = await prisma.assinaturas.findMany({
      where: {
        OR: [
          { status: STATUS_ASSINATURA.atrasada },
          idsVencidas.length ? { id: { in: idsVencidas } } : undefined,
        ].filter(Boolean) as Prisma.assinaturasWhereInput[],
        periodo_tolerancia_ate: { lt: agora },
      },
      select: { id: true, prestador_id: true },
    });

    const idsBloqueadas = bloqueadas.map((item) => item.id);
    const idsApenasAtrasadas = idsVencidas.filter(
      (id) => !idsBloqueadas.includes(id),
    );

    await prisma.$transaction(async (tx) => {
      if (idsApenasAtrasadas.length) {
        await tx.assinaturas.updateMany({
          where: { id: { in: idsApenasAtrasadas } },
          data: {
            status: STATUS_ASSINATURA.atrasada,
            gateway_status: 'vencimento_local_detectado',
          },
        });

        await tx.usuarios.updateMany({
          where: {
            id: {
              in: vencidas
                .filter((item) => idsApenasAtrasadas.includes(item.id))
                .map((item) => item.prestador_id),
            },
          },
          data: { status_cadastro: STATUS_CADASTRO_USUARIO.inadimplente },
        });
      }

      if (idsBloqueadas.length) {
        await tx.assinaturas.updateMany({
          where: { id: { in: idsBloqueadas } },
          data: {
            status: STATUS_ASSINATURA.bloqueada,
            gateway_status: 'tolerancia_expirada',
          },
        });

        await tx.usuarios.updateMany({
          where: {
            id: { in: bloqueadas.map((item) => item.prestador_id) },
          },
          data: { status_cadastro: STATUS_CADASTRO_USUARIO.bloqueado },
        });
      }
    });

    const expiracao = await this.expirarAssinaturasSemConfirmacao();
    const resultado = {
      atrasadas: idsApenasAtrasadas.length,
      bloqueadas: idsBloqueadas.length,
      expiradas: expiracao.expiradas,
    };

    logger.info('Verificacao local de assinaturas concluida', resultado);
    return resultado;
  }

  static validarTokenWebhookAsaas(token?: string) {
    const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN?.trim();

    if (!tokenEsperado) {
      throw erroNegocio('Token do webhook Asaas nao configurado.', 500);
    }

    if (!token || token !== tokenEsperado) {
      throw erroNegocio('Token do webhook Asaas invalido.', 401);
    }
  }

  static statusAssinaturaPorEventoAsaas(
    event?: string,
    paymentStatus?: string,
    subscriptionStatus?: string,
  ): assinaturas_status | null {
    const evento = event?.toUpperCase();
    const statusPagamento = paymentStatus?.toUpperCase();
    const statusAssinatura = subscriptionStatus?.toUpperCase();

    if (
      evento === 'PAYMENT_RECEIVED' ||
      evento === 'PAYMENT_CONFIRMED' ||
      evento === 'PAYMENT_RECEIVED_IN_CASH' ||
      statusPagamento === 'RECEIVED' ||
      statusPagamento === 'CONFIRMED'
    ) {
      return STATUS_ASSINATURA.ativa;
    }

    if (evento === 'PAYMENT_OVERDUE' || statusPagamento === 'OVERDUE') {
      return STATUS_ASSINATURA.atrasada;
    }

    if (
      evento === 'PAYMENT_REFUNDED' ||
      evento === 'PAYMENT_REFUND_DENIED' ||
      evento === 'PAYMENT_CHARGEBACK_REQUESTED' ||
      evento === 'PAYMENT_CHARGEBACK_DISPUTE' ||
      evento === 'PAYMENT_CHARGEBACK_DONE' ||
      statusPagamento === 'REFUNDED' ||
      statusPagamento === 'REFUND_REQUESTED' ||
      statusPagamento === 'CHARGEBACK_REQUESTED' ||
      statusPagamento === 'CHARGEBACK_DISPUTE' ||
      statusPagamento === 'AWAITING_CHARGEBACK_REVERSAL'
    ) {
      return STATUS_ASSINATURA.falhou;
    }

    if (
      evento === 'PAYMENT_DELETED' ||
      evento === 'SUBSCRIPTION_DELETED' ||
      evento === 'SUBSCRIPTION_INACTIVATED' ||
      evento === 'SUBSCRIPTION_CANCELLED' ||
      statusAssinatura === 'INACTIVE' ||
      statusAssinatura === 'CANCELLED' ||
      statusAssinatura === 'DELETED'
    ) {
      return STATUS_ASSINATURA.cancelada;
    }

    if (
      evento === 'PAYMENT_CREATED' ||
      evento === 'PAYMENT_UPDATED' ||
      evento === 'PAYMENT_AWAITING_RISK_ANALYSIS' ||
      statusPagamento === 'PENDING'
    ) {
      return STATUS_ASSINATURA.aguardando_confirmacao;
    }

    return null;
  }

  static async processarWebhookAsaas(input: WebhookAsaasInput) {
    this.validarTokenWebhookAsaas(input.token);

    const payload = payloadAsaas(input.payload);
    const event = payload.event || 'EVENTO_DESCONHECIDO';
    const payment = payload.payment;
    const subscription = payload.subscription;
    const gatewaySubscriptionId = payment?.subscription || subscription?.id;
    const gatewayCustomerId = payment?.customer || subscription?.customer;
    const statusAssinatura = this.statusAssinaturaPorEventoAsaas(
      event,
      payment?.status,
      subscription?.status,
    );

    if (!gatewaySubscriptionId) {
      logger.warn('Webhook Asaas ignorado: assinatura ausente', { event });
      return {
        processado: false,
        motivo: 'assinatura_gateway_ausente',
        event,
      };
    }

    if (!statusAssinatura) {
      logger.info('Webhook Asaas recebido sem acao local', {
        event,
        gatewaySubscriptionId,
      });
      return {
        processado: false,
        motivo: 'evento_sem_mapeamento',
        event,
        gateway_subscription_id: gatewaySubscriptionId,
      };
    }

    const assinaturaAtual = await prisma.assinaturas.findFirst({
      where: { gateway_subscription_id: gatewaySubscriptionId },
      orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
    });

    if (!assinaturaAtual) {
      logger.warn('Webhook Asaas ignorado: assinatura local nao encontrada', {
        event,
        gatewaySubscriptionId,
      });
      return {
        processado: false,
        motivo: 'assinatura_local_nao_encontrada',
        event,
        gateway_subscription_id: gatewaySubscriptionId,
      };
    }

    const agora = new Date();
    const dataPagamento =
      dataAsaas(payment?.paymentDate) ||
      dataAsaas(payment?.clientPaymentDate) ||
      dataAsaas(payment?.confirmedDate) ||
      agora;
    const dataVencimento =
      dataAsaas(subscription?.nextDueDate) ||
      dataAsaas(payment?.dueDate) ||
      adicionarDias(dataPagamento, 30);
    const dados: Prisma.assinaturasUncheckedUpdateInput = {
      status: statusAssinatura,
      gateway: GATEWAY_PAGAMENTO.asaas,
      gateway_customer_id:
        gatewayCustomerId || assinaturaAtual.gateway_customer_id,
      gateway_status: limitarGatewayStatus(
        `${event}:${payment?.status || subscription?.status || statusAssinatura}`,
      ),
    };

    if (statusAssinatura === STATUS_ASSINATURA.ativa) {
      dados.data_ultimo_pagamento = dataPagamento;
      dados.data_proximo_vencimento = dataVencimento;
      dados.periodo_tolerancia_ate = adicionarDias(
        dataVencimento,
        DIAS_TOLERANCIA_ASSINATURA,
      );
      dados.confirmacao_expira_em = null;
      dados.cancelada_em = null;
    }

    if (statusAssinatura === STATUS_ASSINATURA.atrasada) {
      dados.data_proximo_vencimento = dataVencimento;
      dados.periodo_tolerancia_ate = adicionarDias(
        dataVencimento,
        DIAS_TOLERANCIA_ASSINATURA,
      );
      dados.confirmacao_expira_em = null;
    }

    if (statusAssinatura === STATUS_ASSINATURA.aguardando_confirmacao) {
      dados.confirmacao_expira_em =
        assinaturaAtual.confirmacao_expira_em ||
        this.calcularConfirmacaoExpiraEm();
    }

    if (statusAssinatura === STATUS_ASSINATURA.cancelada) {
      dados.cancelada_em = agora;
      dados.confirmacao_expira_em = null;
    }

    if (statusAssinatura === STATUS_ASSINATURA.falhou) {
      dados.confirmacao_expira_em = null;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const assinatura = await tx.assinaturas.update({
        where: { id: assinaturaAtual.id },
        data: dados,
      });

      await tx.usuarios.update({
        where: { id: assinatura.prestador_id },
        data: {
          status_cadastro: statusCadastroPorAssinatura(statusAssinatura),
        },
      });

      await tx.logs_acao.create({
        data: {
          usuario_id: assinatura.prestador_id,
          tabela_afetada: 'assinaturas',
          acao: 'UPDATE',
        },
      });

      return assinatura;
    });

    logger.info('Webhook Asaas processado', {
      event,
      gatewaySubscriptionId,
      assinaturaId: resultado.id,
      status: resultado.status,
    });

    return {
      processado: true,
      event,
      assinatura: resultado,
    };
  }

  static statusCadastroPorAssinatura(status: assinaturas_status) {
    return statusCadastroPorAssinatura(status);
  }
}

export default ServiceAssinatura;
