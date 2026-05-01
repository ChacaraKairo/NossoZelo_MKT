import { NextRequest, NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const prestador = await prisma.usuarios.findFirst({
      where: { id, tipo: { in: [...tiposPrestador] } },
      include: {
        assinaturas: { orderBy: { criado_em: "desc" }, take: 5, include: { planos: true } },
        servicos: true,
        cuidadores: true,
        enfermeiros: true,
        acompanhantes: true,
        avaliacoes_avaliacoes_prestador_idTousuarios: true
      }
    });

    if (!prestador) return NextResponse.json({ error: "Prestador nao encontrado." }, { status: 404 });
    const assinatura = prestador.assinaturas[0];
    return NextResponse.json({
      ...prestador,
      senha: undefined,
      aparece_na_busca:
        prestador.email_confirmado && prestador.status_cadastro === "ativo" && assinatura?.status === "ativa",
      pode_receber_pedidos:
        prestador.email_confirmado && prestador.status_cadastro === "ativo" && assinatura?.status === "ativa"
    });
  } catch (error) {
    return respostaErro(error);
  }
}
