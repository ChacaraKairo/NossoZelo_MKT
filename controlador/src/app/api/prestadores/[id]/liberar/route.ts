import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { liberarUsuarioOperacional } from "@/lib/liberacaoUsuario";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const usuario = await prisma.usuarios.findFirst({
      where: { id, tipo: { in: [...tiposPrestador] } },
      select: { id: true }
    });

    if (!usuario) return NextResponse.json({ error: "Prestador nao encontrado." }, { status: 404 });

    const resultado = await prisma.$transaction((tx) => liberarUsuarioOperacional(tx, id));

    if (!resultado) {
      return NextResponse.json({ error: "Prestador nao encontrado." }, { status: 404 });
    }

    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios" });
    return NextResponse.json({
      message: resultado.assinatura?.status === "ativa"
        ? "Prestador liberado porque ja possui assinatura ativa confirmada pelo Asaas."
        : "E-mail do prestador confirmado. A ativacao profissional depende da confirmacao real de pagamento do Asaas.",
      prestador: resultado.usuario,
      assinatura: resultado.assinatura
    });
  } catch (error) {
    return respostaErro(error);
  }
}
