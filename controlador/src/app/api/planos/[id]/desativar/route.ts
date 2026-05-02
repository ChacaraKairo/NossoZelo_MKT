import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const plano = await prisma.planos.update({
      where: { id: Number(id) },
      data: { ativo: false }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "planos" });

    return NextResponse.json({ message: "Plano desativado.", plano });
  } catch (error) {
    return respostaErro(error);
  }
}
