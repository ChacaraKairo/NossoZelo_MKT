import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

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

    const statusCadastro =
      assinatura.status === "ativa" && !assinatura.usuarios.email_confirmado
        ? "pendente_pagamento"
        : statusCadastroPorAssinatura(assinatura.status);

    await prisma.$transaction(async (tx) => {
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
          status_novo: assinatura.status,
          payload_resumo: { adminId: admin.id, status_cadastro: statusCadastro }
        }
      });
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });

    return NextResponse.json({
      message: "Assinatura reprocessada.",
      assinatura,
      status_cadastro: statusCadastro
    });
  } catch (error) {
    return respostaErro(error);
  }
}
