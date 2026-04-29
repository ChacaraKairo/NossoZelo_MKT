import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";

export async function GET() {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const [
      emailsNaoConfirmados,
      prestadoresSemAssinaturaAtiva,
      aguardandoPagamento,
      assinaturasExpiradas,
      cadastrosPendentes,
      semDadosProfissionais
    ] = await Promise.all([
      prisma.usuarios.findMany({ where: { email_confirmado: false }, take: 50, orderBy: { criado_em: "desc" } }),
      prisma.usuarios.findMany({
        where: {
          tipo: { in: [...tiposPrestador] },
          NOT: { assinaturas: { some: { status: "ativa" } } }
        },
        take: 50,
        orderBy: { criado_em: "desc" }
      }),
      prisma.assinaturas.findMany({
        where: { status: "aguardando_confirmacao" },
        take: 50,
        orderBy: { criado_em: "desc" },
        include: { usuarios: true, planos: true }
      }),
      prisma.assinaturas.findMany({
        where: { status: "expirada" },
        take: 50,
        orderBy: { criado_em: "desc" },
        include: { usuarios: true, planos: true }
      }),
      prisma.usuarios.findMany({
        where: { status_cadastro: "pendente_pagamento" },
        take: 50,
        orderBy: { criado_em: "desc" }
      }),
      prisma.usuarios.findMany({
        where: {
          tipo: { in: [...tiposPrestador] },
          cuidadores: null,
          enfermeiros: null,
          acompanhantes: null
        },
        take: 50,
        orderBy: { criado_em: "desc" }
      })
    ]);

    return NextResponse.json({
      emailsNaoConfirmados,
      prestadoresSemAssinaturaAtiva,
      aguardandoPagamento,
      assinaturasExpiradas,
      cadastrosPendentes,
      semDadosProfissionais
    });
  } catch (error) {
    return respostaErro(error);
  }
}
