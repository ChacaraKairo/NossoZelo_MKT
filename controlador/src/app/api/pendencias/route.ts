import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { tiposPrestador, usuarioAdminResumoSelect } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";

function mascararUsuario<T extends { email: string; cpf: string; telefone: string | null }>(usuario: T) {
  return {
    ...usuario,
    email: mascararEmail(usuario.email),
    cpf: mascararDocumento(usuario.cpf),
    telefone: mascararTelefone(usuario.telefone)
  };
}

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
      prisma.usuarios.findMany({
        where: { email_confirmado: false },
        take: 50,
        orderBy: { criado_em: "desc" },
        select: usuarioAdminResumoSelect
      }),
      prisma.usuarios.findMany({
        where: {
          tipo: { in: [...tiposPrestador] },
          NOT: { assinaturas: { some: { status: "ativa" } } }
        },
        take: 50,
        orderBy: { criado_em: "desc" },
        select: usuarioAdminResumoSelect
      }),
      prisma.assinaturas.findMany({
        where: { status: "aguardando_confirmacao" },
        take: 50,
        orderBy: { criado_em: "desc" },
        include: { usuarios: { select: usuarioAdminResumoSelect }, planos: true }
      }),
      prisma.assinaturas.findMany({
        where: { status: "expirada" },
        take: 50,
        orderBy: { criado_em: "desc" },
        include: { usuarios: { select: usuarioAdminResumoSelect }, planos: true }
      }),
      prisma.usuarios.findMany({
        where: { status_cadastro: "pendente_pagamento" },
        take: 50,
        orderBy: { criado_em: "desc" },
        select: usuarioAdminResumoSelect
      }),
      prisma.usuarios.findMany({
        where: {
          tipo: { in: [...tiposPrestador] },
          cuidadores: null,
          enfermeiros: null,
          acompanhantes: null
        },
        take: 50,
        orderBy: { criado_em: "desc" },
        select: usuarioAdminResumoSelect
      })
    ]);

    return NextResponse.json({
      emailsNaoConfirmados: emailsNaoConfirmados.map(mascararUsuario),
      prestadoresSemAssinaturaAtiva: prestadoresSemAssinaturaAtiva.map(mascararUsuario),
      aguardandoPagamento: aguardandoPagamento.map((assinatura) => ({
        ...assinatura,
        usuarios: mascararUsuario(assinatura.usuarios)
      })),
      assinaturasExpiradas: assinaturasExpiradas.map((assinatura) => ({
        ...assinatura,
        usuarios: mascararUsuario(assinatura.usuarios)
      })),
      cadastrosPendentes: cadastrosPendentes.map(mascararUsuario),
      semDadosProfissionais: semDadosProfissionais.map(mascararUsuario)
    });
  } catch (error) {
    return respostaErro(error);
  }
}
