import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { adminEhMestre, exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { respostaErro } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { listarUsuarios } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";

const CriarAdminSchema = z.object({
  nome: z.string().trim().min(2),
  email: z.string().trim().email(),
  senha: z.string().min(8),
  cpf: z.string().trim().min(11).max(14),
  telefone: z.string().trim().max(20).optional(),
  cep: z.string().trim().max(10).optional()
});

function gerarIdAdmin() {
  return `adm_${randomBytes(8).toString("hex")}`;
}

export async function GET(request: NextRequest) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const data = await listarUsuarios(request.nextUrl.searchParams);
    return NextResponse.json({
      ...data,
      usuarios: data.usuarios.map((usuario) => ({
        ...usuario,
        email: mascararEmail(usuario.email),
        cpf: mascararDocumento(usuario.cpf),
        telefone: mascararTelefone(usuario.telefone)
      }))
    });
  } catch (error) {
    return respostaErro(error);
  }
}

export async function POST(request: NextRequest) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  if (!adminEhMestre(admin)) {
    return NextResponse.json(
      { error: "Apenas o usuario mestre pode cadastrar novos administradores." },
      { status: 403 }
    );
  }

  try {
    const input = CriarAdminSchema.parse(await request.json());
    const senhaHash = await hash(input.senha, 12);

    const usuario = await prisma.$transaction(async (tx) => {
      const criado = await tx.usuarios.create({
        data: {
          id: gerarIdAdmin(),
          nome: input.nome,
          email: input.email,
          senha: senhaHash,
          cpf: input.cpf,
          telefone: input.telefone,
          cep: input.cep || "00000-000",
          tipo: "admin",
          status_cadastro: "ativo",
          email_confirmado: true
        },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          status_cadastro: true,
          email_confirmado: true,
          criado_em: true
        }
      });

      await tx.admins.create({
        data: {
          usuario_id: criado.id,
          cargo: "Administrador do sistema",
          permissao_total: true
        }
      });

      return criado;
    });

    await registrarLogAdministrativo({ adminId: admin.id, tabela: "usuarios", acao: "INSERT" });
    return NextResponse.json({ message: "Administrador cadastrado com sucesso.", usuario }, { status: 201 });
  } catch (error) {
    return respostaErro(error);
  }
}
