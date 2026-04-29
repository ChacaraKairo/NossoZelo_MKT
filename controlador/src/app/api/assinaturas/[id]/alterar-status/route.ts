import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  status: z.enum(["pendente", "aguardando_confirmacao", "ativa", "atrasada", "bloqueada", "cancelada", "falhou", "expirada"])
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const input = Schema.parse(await request.json());
    const { id } = await params;
    const assinatura = await prisma.assinaturas.update({
      where: { id: Number(id) },
      data: {
        status: input.status,
        gateway_status: `manual_${input.status}`,
        cancelada_em: input.status === "cancelada" ? new Date() : undefined
      }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });
    return NextResponse.json({ message: "Status da assinatura atualizado.", assinatura });
  } catch (error) {
    return respostaErro(error);
  }
}
