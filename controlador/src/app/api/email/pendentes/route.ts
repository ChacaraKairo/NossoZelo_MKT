import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const [usuarios, tokens] = await Promise.all([
      prisma.usuarios.findMany({
        where: { email_confirmado: false },
        take: 100,
        orderBy: { criado_em: "desc" },
        select: { id: true, nome: true, email: true, tipo: true, criado_em: true }
      }),
      prisma.confirmacoes_email.findMany({
        take: 100,
        orderBy: { criado_em: "desc" },
        select: {
          id: true,
          usuario_id: true,
          expiracao: true,
          usado: true,
          criado_em: true,
          usuarios: { select: { nome: true, email: true, tipo: true } }
        }
      })
    ]);

    return NextResponse.json({ usuarios, tokens });
  } catch (error) {
    return respostaErro(error);
  }
}
