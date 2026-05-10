import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { obterBaseUrlAsaas } from "@/lib/asaasConfig";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function jsonEstavel(valor: unknown): string {
  if (valor === null || typeof valor !== "object") return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map(jsonEstavel).join(",")}]`;
  return `{${Object.keys(valor as Record<string, unknown>).sort().map((chave) => `${JSON.stringify(chave)}:${jsonEstavel((valor as Record<string, unknown>)[chave])}`).join(",")}}`;
}

function hashPayload(valor: unknown) {
  return createHash("sha256").update(jsonEstavel(valor)).digest("hex");
}

function statusLocalPorStatusAsaas(status?: string | null) {
  const normalizado = String(status || "").toUpperCase();
  // ACTIVE no Asaas significa assinatura criada no gateway; no NossoZelo
  // a ativacao continua dependendo de PAYMENT_RECEIVED/CONFIRMED.
  if (normalizado === "ACTIVE") return null;
  if (["INACTIVE", "CANCELLED", "DELETED"].includes(normalizado)) return "cancelada" as const;
  return null;
}

function dataAsaas(valor?: string | null) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function adicionarDias(data: Date, dias: number) {
  const nova = new Date(data);
  nova.setDate(nova.getDate() + dias);
  return nova;
}

function statusPagamentoRecebido(status?: string | null) {
  const normalizado = String(status || "").toUpperCase();
  return normalizado === "RECEIVED" || normalizado === "CONFIRMED";
}

async function consultarAssinaturaAsaas(gatewaySubscriptionId?: string | null) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey || !gatewaySubscriptionId) return null;

  const baseUrl = obterBaseUrlAsaas();
  const resposta = await fetch(`${baseUrl}/subscriptions/${encodeURIComponent(gatewaySubscriptionId)}`, {
    headers: { access_token: apiKey }
  });

  if (!resposta.ok) {
    return {
      erro: `asaas_${resposta.status}`,
      status: null
    };
  }

  const dados = await resposta.json() as {
    id?: string;
    status?: string;
    nextDueDate?: string;
    customer?: string;
  };

  return {
    id: dados.id || gatewaySubscriptionId,
    status: dados.status || null,
    status_local: statusLocalPorStatusAsaas(dados.status),
    nextDueDate: dados.nextDueDate || null,
    customer: dados.customer || null
  };
}

async function consultarPagamentoRecebidoAsaas(gatewaySubscriptionId?: string | null) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey || !gatewaySubscriptionId) return null;

  const baseUrl = obterBaseUrlAsaas();
  const resposta = await fetch(
    `${baseUrl}/subscriptions/${encodeURIComponent(gatewaySubscriptionId)}/payments?limit=20`,
    { headers: { access_token: apiKey } }
  );

  if (!resposta.ok) {
    return {
      erro: `asaas_payments_${resposta.status}`,
      pagamento: null
    };
  }

  const dados = await resposta.json() as {
    data?: Array<{
      id?: string;
      status?: string;
      paymentDate?: string;
      clientPaymentDate?: string;
      confirmedDate?: string;
      dueDate?: string;
      value?: number | string;
    }>;
  };
  const pagamentos = dados.data || [];
  const pagamentoRecebido = pagamentos.find((pagamento) =>
    statusPagamentoRecebido(pagamento.status)
  );

  if (!pagamentoRecebido) {
    return {
      erro: null,
      pagamento: null,
      total_consultado: pagamentos.length
    };
  }

  return {
    erro: null,
    pagamento: {
      id: pagamentoRecebido.id || null,
      status: pagamentoRecebido.status || null,
      data_pagamento:
        dataAsaas(pagamentoRecebido.paymentDate) ||
        dataAsaas(pagamentoRecebido.clientPaymentDate) ||
        dataAsaas(pagamentoRecebido.confirmedDate) ||
        new Date(),
      data_vencimento: dataAsaas(pagamentoRecebido.dueDate),
      valor: pagamentoRecebido.value ?? null
    },
    total_consultado: pagamentos.length
  };
}

export async function POST(_request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const assinatura = await prisma.assinaturas.findUnique({
      where: { id: Number(id) },
      include: { usuarios: { select: { id: true, email_confirmado: true } } }
    });

    if (!assinatura) return NextResponse.json({ error: "Assinatura nao encontrada." }, { status: 404 });

    const [consultaAsaas, consultaPagamento] = await Promise.all([
      consultarAssinaturaAsaas(assinatura.gateway_subscription_id),
      consultarPagamentoRecebidoAsaas(assinatura.gateway_subscription_id)
    ]);
    const pagamentoRecebido = consultaPagamento?.pagamento;
    const statusReprocessado = pagamentoRecebido
      ? "ativa"
      : consultaAsaas?.status_local || assinatura.status;
    const statusCadastro =
      statusReprocessado === "ativa" && !assinatura.usuarios.email_confirmado
        ? "pendente_pagamento"
        : statusCadastroPorAssinatura(statusReprocessado);
    const payloadResumo = {
      adminId: admin.id,
      status_cadastro: statusCadastro,
      consulta_asaas: consultaAsaas,
      consulta_pagamento: consultaPagamento
        ? {
            ...consultaPagamento,
            pagamento: consultaPagamento.pagamento
              ? {
                  ...consultaPagamento.pagamento,
                  data_pagamento:
                    consultaPagamento.pagamento.data_pagamento.toISOString(),
                  data_vencimento:
                    consultaPagamento.pagamento.data_vencimento?.toISOString() ||
                    null
                }
              : null
          }
        : null
    };

    const assinaturaAtualizada = await prisma.$transaction(async (tx) => {
      const assinaturaAtualizada = await tx.assinaturas.update({
        where: { id: assinatura.id },
        data: {
          status: statusReprocessado,
          gateway_status: pagamentoRecebido
            ? `PAYMENT_REPROCESS:${pagamentoRecebido.status || "RECEIVED"}`
            : consultaAsaas?.status || assinatura.gateway_status,
          gateway_payment_id: pagamentoRecebido?.id || assinatura.gateway_payment_id,
          data_ultimo_pagamento:
            pagamentoRecebido?.data_pagamento || assinatura.data_ultimo_pagamento,
          data_proximo_vencimento: pagamentoRecebido
            ? consultaAsaas?.nextDueDate
              ? new Date(`${consultaAsaas.nextDueDate}T00:00:00`)
              : pagamentoRecebido.data_vencimento
                ? adicionarDias(pagamentoRecebido.data_vencimento, 30)
                : adicionarDias(pagamentoRecebido.data_pagamento, 30)
            : consultaAsaas?.nextDueDate
              ? new Date(`${consultaAsaas.nextDueDate}T00:00:00`)
              : assinatura.data_proximo_vencimento,
          periodo_tolerancia_ate: pagamentoRecebido
            ? adicionarDias(
                consultaAsaas?.nextDueDate
                  ? new Date(`${consultaAsaas.nextDueDate}T00:00:00`)
                  : pagamentoRecebido.data_vencimento
                    ? adicionarDias(pagamentoRecebido.data_vencimento, 30)
                    : adicionarDias(pagamentoRecebido.data_pagamento, 30),
                15
              )
            : assinatura.periodo_tolerancia_ate,
          confirmacao_expira_em: statusReprocessado === "ativa" ? null : assinatura.confirmacao_expira_em,
          cancelada_em: statusReprocessado === "ativa" ? null : assinatura.cancelada_em
        }
      });

      await tx.usuarios.update({
        where: { id: assinatura.prestador_id },
        data: { status_cadastro: statusCadastro }
      });

      await tx.eventos_assinatura.create({
        data: {
          assinatura_id: assinatura.id,
          prestador_id: assinatura.prestador_id,
          plano_id: assinatura.plano_id,
          tipo: "reprocessamento_admin",
          origem: "admin",
          gateway: assinatura.gateway,
          gateway_payment_id: pagamentoRecebido?.id || assinatura.gateway_payment_id,
          gateway_subscription_id: assinatura.gateway_subscription_id,
          status_anterior: assinatura.status,
          status_novo: assinaturaAtualizada.status,
          valor: pagamentoRecebido?.valor ?? undefined,
          payload_hash: hashPayload(payloadResumo),
          payload_resumo: payloadResumo,
          processado_em: new Date()
        }
      });

      return assinaturaAtualizada;
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });

    return NextResponse.json({
      message: pagamentoRecebido
        ? "Pagamento recebido encontrado no Asaas. Assinatura ativada e prestador liberado."
        : "Assinatura reprocessada.",
      assinatura: assinaturaAtualizada,
      status_cadastro: statusCadastro
    });
  } catch (error) {
    return respostaErro(error);
  }
}
