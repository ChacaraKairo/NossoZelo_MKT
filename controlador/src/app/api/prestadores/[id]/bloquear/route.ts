import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    if (id === admin.id) {
      return NextResponse.json({ error: "Nao e permitido bloquear o proprio admin logado." }, { status: 409 });
    }

    const usuario = await prisma.usuarios.findFirst({
      where: { id, tipo: { in: [...tiposPrestador] } },
      select: { id: true }
    });

    if (!usuario) return NextResponse.json({ error: "Prestador nao encontrado." }, { status: 404 });

    const prestador = await prisma.usuarios.update({
      where: { id },
      data: { status_cadastro: "bloqueado" },
      select: { id: true, status_cadastro: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({ message: "Prestador bloqueado.", prestador });
  } catch (error) {
    return respostaErro(error);
  }
}
