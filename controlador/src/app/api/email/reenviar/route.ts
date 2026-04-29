import { randomBytes } from "crypto";
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
    const usuario = await prisma.usuarios.findUnique({
      where: { id: input.usuario_id },
      select: { id: true, email_confirmado: true }
    });

    if (!usuario) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    if (usuario.email_confirmado) return NextResponse.json({ message: "E-mail ja confirmado." });

    await prisma.confirmacoes_email.updateMany({
      where: { usuario_id: usuario.id, usado: false },
      data: { usado: true }
    });

    await prisma.confirmacoes_email.create({
      data: {
        usuario_id: usuario.id,
        token: randomBytes(32).toString("hex"),
        expiracao: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    await registrarLogAdministrativo({ adminId: admin.id, tabela: "confirmacoes_email", acao: "INSERT" });
    return NextResponse.json({
      message: "Novo token criado. O envio SMTP deve permanecer centralizado no backend publico."
    });
  } catch (error) {
    return respostaErro(error);
  }
}
