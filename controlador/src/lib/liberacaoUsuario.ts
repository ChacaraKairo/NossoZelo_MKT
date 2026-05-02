import type { Prisma } from "@prisma/client";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
import { tiposPrestador } from "@/lib/queries";

export async function liberarUsuarioOperacional(tx: Prisma.TransactionClient, usuarioId: string) {
  const usuario = await tx.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true }
  });

  if (!usuario) return null;
  const ehPrestador = tiposPrestador.includes(usuario.tipo as (typeof tiposPrestador)[number]);
  const assinaturaAtual = ehPrestador
    ? await tx.assinaturas.findFirst({
        where: { prestador_id: usuario.id },
        orderBy: [{ criado_em: "desc" }, { id: "desc" }]
      })
    : null;
  const statusCadastro = ehPrestador
    ? assinaturaAtual
      ? statusCadastroPorAssinatura(assinaturaAtual.status)
      : "pendente_pagamento"
    : "ativo";

  const usuarioAtualizado = await tx.usuarios.update({
    where: { id: usuario.id },
    data: {
      email_confirmado: true,
      status_cadastro: statusCadastro
    },
    select: {
      id: true,
      tipo: true,
      status_cadastro: true,
      email_confirmado: true
    }
  });

  if (!ehPrestador) {
    return { usuario: usuarioAtualizado, assinatura: null };
  }

  return { usuario: usuarioAtualizado, assinatura: assinaturaAtual };
}
