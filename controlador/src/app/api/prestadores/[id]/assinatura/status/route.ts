import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
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
    const assinatura = await prisma.assinaturas.findFirst({
      where: { prestador_id: id },
      orderBy: { criado_em: "desc" }
    });

    if (!assinatura) return NextResponse.json({ error: "Prestador sem assinatura." }, { status: 404 });

    const atualizada = await prisma.$transaction(async (tx) => {
      const assinaturaAtualizada = await tx.assinaturas.update({
        where: { id: assinatura.id },
        data: {
          status: input.status,
          gateway_status: `manual_${input.status}`,
          cancelada_em: input.status === "cancelada" ? new Date() : assinatura.cancelada_em
        }
      });

      await tx.usuarios.update({
        where: { id: assinaturaAtualizada.prestador_id },
        data: { status_cadastro: statusCadastroPorAssinatura(input.status) }
      });

      return assinaturaAtualizada;
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });
    return NextResponse.json({ message: "Assinatura atualizada.", assinatura: atualizada });
  } catch (error) {
    return respostaErro(error);
  }
}
