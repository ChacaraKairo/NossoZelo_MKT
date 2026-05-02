import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  status: z.enum(["pendente", "aguardando_confirmacao", "ativa", "atrasada", "bloqueada", "cancelada", "falhou", "expirada"]),
  confirmacao: z.literal(true).optional()
});

function hashPayload(valor: unknown) {
  return createHash("sha256").update(JSON.stringify(valor)).digest("hex");
}

type Params = { params: Promise<{ id: string }> };

async function alterarStatus(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const input = Schema.parse(await request.json());
    if (["cancelada", "bloqueada", "falhou"].includes(input.status) && input.confirmacao !== true) {
      return NextResponse.json({ error: "Confirme a acao administrativa antes de alterar para este status." }, { status: 400 });
    }

    const { id } = await params;
    const assinatura = await prisma.$transaction(async (tx) => {
      const anterior = await tx.assinaturas.findUnique({
        where: { id: Number(id) },
        select: { status: true }
      });

      const atualizada = await tx.assinaturas.update({
        where: { id: Number(id) },
        data: {
          status: input.status,
          gateway_status: `manual_${input.status}`,
          cancelada_em: input.status === "cancelada" ? new Date() : undefined
        }
      });

      await tx.usuarios.update({
        where: { id: atualizada.prestador_id },
        data: { status_cadastro: statusCadastroPorAssinatura(input.status) }
      });

      const payloadResumo = { adminId: admin.id };
      await tx.eventos_assinatura.create({
        data: {
          assinatura_id: atualizada.id,
          prestador_id: atualizada.prestador_id,
          plano_id: atualizada.plano_id,
          tipo: "alteracao_status_admin",
          origem: "admin",
          gateway: atualizada.gateway,
          gateway_subscription_id: atualizada.gateway_subscription_id,
          status_anterior: anterior?.status || null,
          status_novo: atualizada.status,
          payload_hash: hashPayload(payloadResumo),
          payload_resumo: payloadResumo,
          processado_em: new Date()
        }
      });

      return atualizada;
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });
    return NextResponse.json({ message: "Status da assinatura atualizado.", assinatura });
  } catch (error) {
    return respostaErro(error);
  }
}

export async function POST(request: Request, context: Params) {
  return alterarStatus(request, context);
}

export async function PATCH(request: Request, context: Params) {
  return alterarStatus(request, context);
}
