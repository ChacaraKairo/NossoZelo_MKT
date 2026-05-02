import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { dadosPlano, PlanoPayloadSchema } from "@/lib/planoSchemas";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const plano = await prisma.planos.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { assinaturas: true } } }
    });
    if (!plano) return NextResponse.json({ error: "Plano nao encontrado." }, { status: 404 });

    return NextResponse.json(plano);
  } catch (error) {
    return respostaErro(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const input = PlanoPayloadSchema.parse(await request.json());
    const plano = await prisma.planos.update({
      where: { id: Number(id) },
      data: dadosPlano(input)
    });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "planos" });

    return NextResponse.json({ message: "Plano atualizado.", plano });
  } catch (error) {
    return respostaErro(error);
  }
}
