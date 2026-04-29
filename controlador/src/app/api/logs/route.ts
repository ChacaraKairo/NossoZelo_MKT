import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const logs = await prisma.logs_acao.findMany({
      take: 100,
      orderBy: { data: "desc" },
      include: { usuarios: { select: { id: true, nome: true, email: true, tipo: true } } }
    });
    return NextResponse.json({ logs });
  } catch (error) {
    return respostaErro(error);
  }
}
