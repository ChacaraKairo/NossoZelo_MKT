import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
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

async function consultarAssinaturaAsaas(gatewaySubscriptionId?: string | null) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  const baseUrl = process.env.ASAAS_BASE_URL?.trim() || "https://api-sandbox.asaas.com/v3";
  if (!apiKey || !gatewaySubscriptionId) return null;

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

    const consultaAsaas = await consultarAssinaturaAsaas(assinatura.gateway_subscription_id);
    const statusReprocessado = consultaAsaas?.status_local || assinatura.status;
    const statusCadastro =
      statusReprocessado === "ativa" && !assinatura.usuarios.email_confirmado
        ? "pendente_pagamento"
        : statusCadastroPorAssinatura(statusReprocessado);
    const payloadResumo = {
      adminId: admin.id,
      status_cadastro: statusCadastro,
      consulta_asaas: consultaAsaas
    };

    const assinaturaAtualizada = await prisma.$transaction(async (tx) => {
      const assinaturaAtualizada = await tx.assinaturas.update({
        where: { id: assinatura.id },
        data: {
          status: statusReprocessado,
          gateway_status: consultaAsaas?.status || assinatura.gateway_status,
          data_proximo_vencimento: consultaAsaas?.nextDueDate
            ? new Date(`${consultaAsaas.nextDueDate}T00:00:00`)
            : assinatura.data_proximo_vencimento
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
          gateway_subscription_id: assinatura.gateway_subscription_id,
          status_anterior: assinatura.status,
          status_novo: assinaturaAtualizada.status,
          payload_hash: hashPayload(payloadResumo),
          payload_resumo: payloadResumo,
          processado_em: new Date()
        }
      });

      return assinaturaAtualizada;
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });

    return NextResponse.json({
      message: "Assinatura reprocessada.",
      assinatura: assinaturaAtualizada,
      status_cadastro: statusCadastro
    });
  } catch (error) {
    return respostaErro(error);
  }
}
