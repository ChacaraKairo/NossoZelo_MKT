import type { assinaturas_status, Prisma } from "@prisma/client";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";

type AsaasWebhookInput = {
  token?: string | null;
  payload: unknown;
};

type AsaasPayment = {
  id?: string;
  customer?: string;
  subscription?: string;
  status?: string;
  value?: number | string;
  netValue?: number | string;
  paymentDate?: string;
  clientPaymentDate?: string;
  confirmedDate?: string;
  dueDate?: string;
  externalReference?: string;
};

type AsaasSubscription = {
  id?: string;
  customer?: string;
  status?: string;
  nextDueDate?: string;
};

type AsaasWebhookPayload = {
  id?: string;
  event?: string;
  dateCreated?: string;
  payment?: AsaasPayment;
  subscription?: AsaasSubscription;
};

function erroWebhook(message: string, status = 400) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function validarToken(token?: string | null) {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN?.trim();

  if (!esperado) {
    throw erroWebhook("ASAAS_WEBHOOK_TOKEN nao configurado.", 500);
  }

  if (!token || token !== esperado) {
    throw erroWebhook("Token do webhook Asaas invalido.", 401);
  }
}

function payloadAsaas(payload: unknown): AsaasWebhookPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw erroWebhook("Payload do webhook Asaas invalido.", 400);
  }

  return payload as AsaasWebhookPayload;
}

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

function dataAsaas(valor?: string | null) {
  if (!valor) return undefined;

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? undefined : data;
}

function numeroAsaas(valor?: number | string | null) {
  if (valor === undefined || valor === null || valor === "") return undefined;

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function limitar(valor: string, tamanho: number) {
  return valor.slice(0, tamanho);
}

function jsonEstavel(valor: unknown): string {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map(jsonEstavel).join(",")}]`;
  return `{${Object.keys(valor as Record<string, unknown>).sort().map((chave) => `${JSON.stringify(chave)}:${jsonEstavel((valor as Record<string, unknown>)[chave])}`).join(",")}}`;
}

function hashPayload(valor: unknown) {
  return createHash("sha256").update(jsonEstavel(valor)).digest("hex");
}

function statusAssinaturaPorEventoAsaas(
  event?: string,
  paymentStatus?: string,
  subscriptionStatus?: string
): assinaturas_status | null {
  const evento = event?.toUpperCase();
  const statusPagamento = paymentStatus?.toUpperCase();
  const statusAssinatura = subscriptionStatus?.toUpperCase();

  if (
    evento === "PAYMENT_RECEIVED" ||
    evento === "PAYMENT_CONFIRMED" ||
    evento === "PAYMENT_RECEIVED_IN_CASH" ||
    statusPagamento === "RECEIVED" ||
    statusPagamento === "CONFIRMED"
  ) {
    return "ativa";
  }

  if (evento === "PAYMENT_OVERDUE" || statusPagamento === "OVERDUE") return "atrasada";

  if (
    evento === "PAYMENT_REFUNDED" ||
    evento === "PAYMENT_PARTIALLY_REFUNDED" ||
    evento === "PAYMENT_REFUND_IN_PROGRESS" ||
    evento === "PAYMENT_CHARGEBACK_REQUESTED" ||
    evento === "PAYMENT_CHARGEBACK_DISPUTE" ||
    statusPagamento === "REFUNDED" ||
    statusPagamento === "REFUND_REQUESTED" ||
    statusPagamento === "CHARGEBACK_REQUESTED" ||
    statusPagamento === "CHARGEBACK_DISPUTE"
  ) {
    return "falhou";
  }

  if (
    evento === "PAYMENT_DELETED" ||
    evento === "SUBSCRIPTION_DELETED" ||
    evento === "SUBSCRIPTION_INACTIVATED" ||
    evento === "SUBSCRIPTION_CANCELLED" ||
    statusAssinatura === "INACTIVE" ||
    statusAssinatura === "CANCELLED" ||
    statusAssinatura === "DELETED"
  ) {
    return "cancelada";
  }

  if (
    evento === "PAYMENT_CREATED" ||
    evento === "PAYMENT_UPDATED" ||
    evento === "PAYMENT_AWAITING_RISK_ANALYSIS" ||
    statusPagamento === "PENDING"
  ) {
    return "aguardando_confirmacao";
  }

  return null;
}

async function localizarAssinatura(subscriptionId?: string) {
  if (subscriptionId) {
    const porAssinatura = await prisma.assinaturas.findFirst({
      where: { gateway_subscription_id: subscriptionId },
      orderBy: [{ criado_em: "desc" }, { id: "desc" }]
    });
    if (porAssinatura) return porAssinatura;
  }

  return null;
}

export async function processarWebhookAsaasControlador(input: AsaasWebhookInput) {
  validarToken(input.token);

  const payload = payloadAsaas(input.payload);
  const event = payload.event || "EVENTO_DESCONHECIDO";
  const payment = payload.payment;
  const subscription = payload.subscription;
  const eventId = payload.id ? limitar(payload.id, 191) : null;
  const subscriptionId = payment?.subscription || subscription?.id;
  const customerId = payment?.customer || subscription?.customer;
  const prestadorReferencia = payment?.externalReference;
  const statusAssinatura = statusAssinaturaPorEventoAsaas(
    event,
    payment?.status,
    subscription?.status
  );
  const payloadJson = {
    event,
    paymentId: payment?.id || null,
    paymentStatus: payment?.status || null,
    subscriptionId: subscriptionId || null,
    subscriptionStatus: subscription?.status || null,
    customerId: customerId || null,
    dueDate: payment?.dueDate || subscription?.nextDueDate || null,
    paymentDate:
      payment?.paymentDate ||
      payment?.clientPaymentDate ||
      payment?.confirmedDate ||
      null
  } satisfies Prisma.InputJsonValue;
  const payloadHash = hashPayload(payloadJson);
  const pagoEm =
    dataAsaas(payment?.paymentDate) ||
    dataAsaas(payment?.clientPaymentDate) ||
    dataAsaas(payment?.confirmedDate);

  if (eventId) {
    const eventoExistente = await prisma.eventos_assinatura.findUnique({
      where: { gateway_event_id: eventId },
      select: { id: true }
    });

    if (eventoExistente) {
      return {
        processado: false,
        duplicado: true,
        motivo: "evento_ja_processado",
        evento_assinatura_id: eventoExistente.id
      };
    }

    const logExistente = await prisma.asaas_webhook_logs.findUnique({
      where: { event_id: eventId }
    });

    if (logExistente) {
      return {
        processado: false,
        duplicado: true,
        motivo: "evento_ja_processado",
        log_id: logExistente.id
      };
    }
  }

  const log = await prisma.asaas_webhook_logs.create({
    data: {
      event_id: eventId,
      event: limitar(event, 80),
      payment_id: payment?.id ? limitar(payment.id, 120) : null,
      subscription_id: subscriptionId ? limitar(subscriptionId, 120) : null,
      customer_id: customerId ? limitar(customerId, 120) : null,
      prestador_id: prestadorReferencia ? limitar(prestadorReferencia, 20) : null,
      valor: numeroAsaas(payment?.value),
      pago_em: pagoEm,
      payload: payloadJson
    }
  });

  try {
    if (!statusAssinatura) {
      const atualizado = await prisma.asaas_webhook_logs.update({
        where: { id: log.id },
        data: {
          status_processamento: "ignorado",
          motivo: "evento_sem_mapeamento"
        }
      });

      await prisma.eventos_assinatura.create({
        data: {
          tipo: "webhook_ignorado",
          origem: "webhook_asaas",
          gateway: "asaas",
          gateway_event_id: eventId,
          gateway_payment_id: payment?.id ? limitar(payment.id, 120) : null,
          gateway_subscription_id: subscriptionId ? limitar(subscriptionId, 120) : null,
          status_novo: statusAssinatura,
          payload_hash: payloadHash,
          payload_resumo: payloadJson,
          processado_em: new Date()
        }
      });

      return { processado: false, motivo: atualizado.motivo, log_id: atualizado.id };
    }

    if (!subscriptionId) {
      const atualizado = await prisma.asaas_webhook_logs.update({
        where: { id: log.id },
        data: {
          status_processamento: "erro",
          motivo: "assinatura_gateway_ausente"
        }
      });

      await prisma.eventos_assinatura.create({
        data: {
          tipo: "webhook_ignorado",
          origem: "webhook_asaas",
          gateway: "asaas",
          gateway_event_id: eventId,
          gateway_payment_id: payment?.id ? limitar(payment.id, 120) : null,
          status_novo: statusAssinatura,
          payload_hash: payloadHash,
          payload_resumo: payloadJson,
          processado_em: new Date()
        }
      });

      return { processado: false, motivo: atualizado.motivo, log_id: atualizado.id };
    }

    const assinaturaAtual = await localizarAssinatura(subscriptionId);

    if (!assinaturaAtual) {
      const atualizado = await prisma.asaas_webhook_logs.update({
        where: { id: log.id },
        data: {
          status_processamento: "erro",
          motivo: "assinatura_local_nao_encontrada"
        }
      });

      await prisma.eventos_assinatura.create({
        data: {
          tipo: "webhook_assinatura_nao_encontrada",
          origem: "webhook_asaas",
          gateway: "asaas",
          gateway_event_id: eventId,
          gateway_payment_id: payment?.id ? limitar(payment.id, 120) : null,
          gateway_subscription_id: subscriptionId ? limitar(subscriptionId, 120) : null,
          status_novo: statusAssinatura,
          payload_hash: payloadHash,
          payload_resumo: payloadJson,
          processado_em: new Date()
        }
      });

      return { processado: false, motivo: atualizado.motivo, log_id: atualizado.id };
    }

    const dataPagamento = pagoEm || new Date();
    const dataVencimento =
      dataAsaas(subscription?.nextDueDate) ||
      dataAsaas(payment?.dueDate) ||
      adicionarDias(dataPagamento, 30);
    const dados: Prisma.assinaturasUncheckedUpdateInput = {
      status: statusAssinatura,
      gateway: "asaas",
      gateway_customer_id: customerId || assinaturaAtual.gateway_customer_id,
      gateway_subscription_id: subscriptionId || assinaturaAtual.gateway_subscription_id,
      gateway_status: limitar(
        `${event}:${payment?.status || subscription?.status || statusAssinatura}`,
        60
      )
    };

    if (statusAssinatura === "ativa") {
      dados.data_ultimo_pagamento = dataPagamento;
      dados.data_proximo_vencimento = dataVencimento;
      dados.periodo_tolerancia_ate = adicionarDias(dataVencimento, 15);
      dados.confirmacao_expira_em = null;
      dados.cancelada_em = null;
    }

    if (statusAssinatura === "atrasada") {
      dados.data_proximo_vencimento = dataVencimento;
      dados.periodo_tolerancia_ate = adicionarDias(dataVencimento, 15);
      dados.confirmacao_expira_em = null;
    }

    if (statusAssinatura === "aguardando_confirmacao") {
      dados.confirmacao_expira_em = assinaturaAtual.confirmacao_expira_em || adicionarDias(new Date(), 3);
    }

    if (statusAssinatura === "cancelada") {
      dados.cancelada_em = new Date();
      dados.confirmacao_expira_em = null;
    }

    if (statusAssinatura === "falhou") {
      dados.confirmacao_expira_em = null;
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const assinatura = await tx.assinaturas.update({
        where: { id: assinaturaAtual.id },
        data: dados
      });

      await tx.usuarios.update({
        where: { id: assinatura.prestador_id },
        data: { status_cadastro: statusCadastroPorAssinatura(statusAssinatura) }
      });

      await tx.logs_acao.create({
        data: {
          usuario_id: assinatura.prestador_id,
          tabela_afetada: "assinaturas",
          acao: "UPDATE"
        }
      });

      await tx.eventos_assinatura.create({
        data: {
          assinatura_id: assinatura.id,
          prestador_id: assinatura.prestador_id,
          plano_id: assinatura.plano_id,
          tipo: statusAssinatura === "ativa" ? "pagamento_confirmado" : statusAssinatura === "atrasada" ? "pagamento_atrasado" : "webhook_asaas",
          origem: "webhook_asaas",
          gateway: "asaas",
          gateway_event_id: eventId,
          gateway_payment_id: payment?.id ? limitar(payment.id, 120) : null,
          gateway_subscription_id: subscriptionId ? limitar(subscriptionId, 120) : null,
          status_anterior: assinaturaAtual.status,
          status_novo: assinatura.status,
          valor: numeroAsaas(payment?.value),
          payload_hash: payloadHash,
          payload_resumo: payloadJson
          ,
          processado_em: new Date()
        }
      });

      const logAtualizado = await tx.asaas_webhook_logs.update({
        where: { id: log.id },
        data: {
          status_processamento: "sucesso",
          motivo: statusAssinatura === "ativa" ? "pagamento_confirmado_ativacao_aplicada" : "status_assinatura_atualizado",
          prestador_id: assinatura.prestador_id,
          assinatura_id: assinatura.id,
          assinatura_status_antes: assinaturaAtual.status,
          assinatura_status_depois: assinatura.status
        }
      });

      return { assinatura, log: logAtualizado };
    });

    return {
      processado: true,
      event,
      assinatura_id: resultado.assinatura.id,
      prestador_id: resultado.assinatura.prestador_id,
      status: resultado.assinatura.status,
      log_id: resultado.log.id
    };
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro ao processar webhook Asaas.";

    await prisma.asaas_webhook_logs.update({
      where: { id: log.id },
      data: {
        status_processamento: "erro",
        motivo: limitar(mensagem, 255)
      }
    });

    throw error;
  }
}
