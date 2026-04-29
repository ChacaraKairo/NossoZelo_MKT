import { NextResponse } from "next/server";
import { z } from "zod";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ usuario_id: z.string().min(1) });

export async function POST(request: Request) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const input = Schema.parse(await request.json());
    const usuario = await prisma.usuarios.update({
      where: { id: input.usuario_id },
      data: {
        email_confirmado: true,
        confirmacoes_email: { updateMany: { where: { usado: false }, data: { usado: true } } }
      },
      select: { id: true, email_confirmado: true }
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "confirmacoes_email" });
    return NextResponse.json({ message: "E-mail confirmado manualmente.", usuario });
  } catch (error) {
    return respostaErro(error);
  }
}
