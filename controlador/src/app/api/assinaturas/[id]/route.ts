import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const assinatura = await prisma.assinaturas.findUnique({
      where: { id: Number(id) },
      include: { usuarios: true, planos: true }
    });
    if (!assinatura) return NextResponse.json({ error: "Assinatura nao encontrada." }, { status: 404 });
    return NextResponse.json(assinatura);
  } catch (error) {
    return respostaErro(error);
  }
}
