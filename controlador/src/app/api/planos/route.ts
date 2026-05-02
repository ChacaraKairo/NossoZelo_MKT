import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { dadosPlano, PlanoPayloadSchema } from "@/lib/planoSchemas";
import { prisma } from "@/lib/prisma";
import { normalizarBusca } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const params = request.nextUrl.searchParams;
    const busca = normalizarBusca(params.get("busca"));
    const status = normalizarBusca(params.get("status"));
    const where: Prisma.planosWhereInput = {};

    if (busca) where.nome = { contains: busca };
    if (status === "ativo") where.ativo = true;
    if (status === "inativo") where.ativo = false;

    const planos = await prisma.planos.findMany({
      where,
      orderBy: [{ ordem: "asc" }, { id: "asc" }],
      include: { _count: { select: { assinaturas: true } } }
    });

    return NextResponse.json({ planos });
  } catch (error) {
    return respostaErro(error);
  }
}

export async function POST(request: Request) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const input = PlanoPayloadSchema.parse(await request.json());
    const plano = await prisma.planos.create({ data: dadosPlano(input) });
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "planos", acao: "INSERT" });

    return NextResponse.json({ message: "Plano criado.", plano }, { status: 201 });
  } catch (error) {
    return respostaErro(error);
  }
}
