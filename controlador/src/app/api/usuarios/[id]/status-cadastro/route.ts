import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const Schema = z.object({
  status_cadastro: z.enum([
    "ativo",
    "pendente_pagamento",
    "aguardando_confirmacao_pagamento",
    "inadimplente",
    "bloqueado",
    "cancelado"
  ])
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const input = Schema.parse(await request.json());
    const { id } = await params;
    if (id === admin.id && input.status_cadastro === "bloqueado") {
      return NextResponse.json({ error: "Nao e permitido bloquear o proprio admin logado." }, { status: 409 });
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data: { status_cadastro: input.status_cadastro },
      select: { id: true, status_cadastro: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({ message: "Status atualizado.", usuario });
  } catch (error) {
    return respostaErro(error);
  }
}
