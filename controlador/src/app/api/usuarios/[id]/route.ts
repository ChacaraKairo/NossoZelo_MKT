import { NextRequest, NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf: true,
        sexo: true,
        data_nascimento: true,
        cep: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        pais: true,
        tipo: true,
        status_cadastro: true,
        email_confirmado: true,
        criado_em: true,
        avaliacao_media: true,
        assinaturas: { orderBy: { criado_em: "desc" }, take: 5, include: { planos: true } },
        servicos: true,
        contratacoes_contratacoes_cliente_idTousuarios: { take: 10, orderBy: { id: "desc" } },
        contratacoes_contratacoes_prestador_idTousuarios: { take: 10, orderBy: { id: "desc" } },
        avaliacoes_avaliacoes_cliente_idTousuarios: { take: 10, orderBy: { id: "desc" } },
        avaliacoes_avaliacoes_prestador_idTousuarios: { take: 10, orderBy: { id: "desc" } }
      }
    });

    if (!usuario) return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    return NextResponse.json(usuario);
  } catch (error) {
    return respostaErro(error);
  }
}
