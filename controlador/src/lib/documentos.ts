import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listarDocumentosPendentes() {
  return prisma.documentos_verificacao.findMany({
    where: { status: { in: ["enviado", "em_validacao", "pendente_revisao"] } },
    orderBy: { criado_em: "asc" },
    include: {
      usuarios: {
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          documentos_status: true,
          identidade_status: true,
          profissional_status: true
        }
      }
    }
  });
}

export async function obterDocumento(id: number) {
  return prisma.documentos_verificacao.findUnique({
    where: { id },
    include: {
      usuarios: {
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          documentos_status: true,
          identidade_status: true,
          profissional_status: true
        }
      },
      revisoes: { orderBy: { criado_em: "desc" } }
    }
  });
}

async function recalcularStatusUsuario(usuarioId: string) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true }
  });
  if (!usuario) return null;

  const documentos = await prisma.documentos_verificacao.findMany({
    where: { usuario_id: usuarioId },
    select: { tipo_documento: true, status: true }
  });

  const identidade = new Set(["documento_identidade", "identidade_frente", "identidade_verso", "cpf", "cnh", "selfie"]);
  const profissionais = new Set(["comprovante_profissional", "certificado_curso", "coren"]);
  const identidadeAprovada = documentos.some((doc) => identidade.has(doc.tipo_documento) && doc.status === "aprovado");
  const profissionalExigido = usuario.tipo === "enfermeiro";
  const profissionalAprovado = documentos.some((doc) => profissionais.has(doc.tipo_documento) && doc.status === "aprovado");
  const temRecusado = documentos.some((doc) => doc.status === "recusado");
  const temPendente = documentos.some((doc) => ["enviado", "em_validacao", "pendente_revisao"].includes(doc.status));

  const documentosStatus =
    identidadeAprovada && (!profissionalExigido || profissionalAprovado)
      ? "aprovado"
      : temRecusado
        ? "recusado"
        : temPendente || documentos.length > 0
          ? "pendente_revisao"
          : "nao_enviado";

  return prisma.usuarios.update({
    where: { id: usuarioId },
    data: {
      documentos_status: documentosStatus,
      identidade_status: identidadeAprovada ? "aprovada" : temRecusado ? "reprovada" : "em_analise",
      profissional_status: profissionalExigido
        ? profissionalAprovado
          ? "aprovado"
          : temRecusado
            ? "reprovado"
            : "pendente"
        : "nao_aplicavel",
      documentos_revisado_em: new Date()
    },
    select: {
      id: true,
      documentos_status: true,
      identidade_status: true,
      profissional_status: true
    }
  });
}

export async function decidirDocumento(input: {
  documentoId: number;
  adminId: string;
  decisao: "aprovado" | "recusado";
  motivo: string;
}) {
  const motivo = input.motivo.trim();
  if (!motivo) throw new Error("Motivo obrigatorio.");

  return prisma.$transaction(async (tx) => {
    const documento = await tx.documentos_verificacao.findUnique({
      where: { id: input.documentoId },
      select: { id: true, usuario_id: true }
    });
    if (!documento) throw new Error("Documento nao encontrado.");

    const atualizado = await tx.documentos_verificacao.update({
      where: { id: input.documentoId },
      data: {
        status: input.decisao,
        motivo_recusa: input.decisao === "recusado" ? motivo : null
      }
    });

    await tx.revisoes_documentos.create({
      data: {
        documento_id: input.documentoId,
        usuario_id: documento.usuario_id,
        admin_id: input.adminId,
        decisao: input.decisao,
        motivo
      }
    });

    await tx.logs_acao.create({
      data: {
        usuario_id: input.adminId,
        tabela_afetada: input.decisao === "aprovado" ? "documento_aprovado_admin" : "documento_recusado_admin",
        acao: "UPDATE"
      }
    });

    return atualizado;
  }).then(async (documento) => {
    await recalcularStatusUsuario(documento.usuario_id);
    return documento;
  });
}

export type DocumentoPendente = Prisma.PromiseReturnType<typeof listarDocumentosPendentes>[number];
