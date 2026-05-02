import { NextResponse } from "next/server";
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
