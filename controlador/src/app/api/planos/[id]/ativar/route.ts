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
    const atual = await prisma.planos.findUnique({ where: { id: Number(id) } });
    if (!atual) return NextResponse.json({ error: "Plano nao encontrado." }, { status: 404 });
    if (Number(atual.valor) <= 0) {
      return NextResponse.json({ error: "Plano com valor zerado nao pode ser ativado." }, { status: 400 });
    }

    const plano = await prisma.planos.update({
      where: { id: atual.id },
      data: { ativo: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "planos" });

    return NextResponse.json({ message: "Plano ativado.", plano });
  } catch (error) {
    return respostaErro(error);
  }
}
