import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { liberarUsuarioOperacional } from "@/lib/liberacaoUsuario";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ motivo: z.string().max(300).optional() });
type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    Schema.parse(await request.json().catch(() => ({})));
    const { id } = await params;
    const resultado = await prisma.$transaction(async (tx) => {
      const liberacao = await liberarUsuarioOperacional(tx, id);
      if (!liberacao) return null;
      return liberacao;
    });

    if (!resultado) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });

    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({
      message: resultado.assinatura
        ? "Usuario com e-mail confirmado. Assinatura profissional segue o status real do Asaas."
        : "Usuario liberado e e-mail confirmado.",
      ...resultado
    });
  } catch (error) {
    return respostaErro(error);
  }
}
