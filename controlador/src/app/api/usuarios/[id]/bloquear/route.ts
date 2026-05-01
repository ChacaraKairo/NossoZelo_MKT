import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ motivo: z.string().max(300).optional() });
type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    Schema.parse(await request.json().catch(() => ({})));
    const { id } = await params;
    if (id === admin.id) {
      return NextResponse.json({ error: "Nao e permitido bloquear o proprio admin logado." }, { status: 409 });
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data: { status_cadastro: "bloqueado" },
      select: { id: true, status_cadastro: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({ message: "Usuario bloqueado.", usuario });
  } catch (error) {
    return respostaErro(error);
  }
}
