import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const prestador = await prisma.usuarios.update({
      where: { id },
      data: { status_cadastro: "ativo" },
      select: { id: true, status_cadastro: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({ message: "Prestador liberado.", prestador });
  } catch (error) {
    return respostaErro(error);
  }
}
