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
    const usuario = await prisma.usuarios.update({
      where: { id },
      data: {
        email_confirmado: true,
        confirmacoes_email: { updateMany: { where: { usado: false }, data: { usado: true } } }
      },
      select: { id: true, email_confirmado: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({ message: "E-mail confirmado manualmente.", usuario });
  } catch (error) {
    return respostaErro(error);
  }
}
