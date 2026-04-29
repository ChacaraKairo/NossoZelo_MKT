import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { limitePagina, normalizarBusca, paginaAtual } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const params = request.nextUrl.searchParams;
    const page = paginaAtual(params.get("page"));
    const limit = limitePagina(params.get("limit"));
    const status = normalizarBusca(params.get("status"));
    const gateway = normalizarBusca(params.get("gateway"));
    const prestador = normalizarBusca(params.get("prestador"));
    const vencidas = params.get("vencidas") === "true";
    const aguardando = params.get("aguardando_confirmacao") === "true";

    const where: Prisma.assinaturasWhereInput = {};
    if (status) where.status = status as Prisma.Enumassinaturas_statusFilter["equals"];
    if (gateway) where.gateway = gateway;
    if (prestador) where.usuarios = { nome: { contains: prestador } };
    if (vencidas) where.data_proximo_vencimento = { lt: new Date() };
    if (aguardando) where.status = "aguardando_confirmacao";

    const [total, assinaturas] = await Promise.all([
      prisma.assinaturas.count({ where }),
      prisma.assinaturas.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { criado_em: "desc" },
        include: { usuarios: true, planos: true }
      })
    ]);

    return NextResponse.json({ total, page, limit, assinaturas });
  } catch (error) {
    return respostaErro(error);
  }
}
