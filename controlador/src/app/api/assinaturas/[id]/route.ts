import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { usuarioAdminResumoSelect } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const assinatura = await prisma.assinaturas.findUnique({
      where: { id: Number(id) },
      include: { usuarios: { select: usuarioAdminResumoSelect }, planos: true }
    });
    if (!assinatura) return NextResponse.json({ error: "Assinatura nao encontrada." }, { status: 404 });
    return NextResponse.json({
      ...assinatura,
      usuarios: {
        ...assinatura.usuarios,
        email: mascararEmail(assinatura.usuarios.email),
        cpf: mascararDocumento(assinatura.usuarios.cpf),
        telefone: mascararTelefone(assinatura.usuarios.telefone)
      }
    });
  } catch (error) {
    return respostaErro(error);
  }
}
