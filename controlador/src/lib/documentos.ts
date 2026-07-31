import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listarDocumentosPendentes() {
  return prisma.documentos_verificacao.findMany({
    where: { status: { in: ["enviado", "em_validacao", "pendente_revisao"] } },
    orderBy: { criado_em: "asc" },
    include: {
      tipoDocumento: {
        select: { codigo: true, nome: true, categoria: true, obrigatorio_busca: true }
      },
      analises: {
        orderBy: { criado_em: "desc" },
        take: 1,
        select: { sinal: true, score: true, status: true, precisa_revisao: true, motivo: true }
      },
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
      tipoDocumento: {
        select: {
          codigo: true,
          nome: true,
          categoria: true,
          obrigatorio_busca: true,
          campos_esperados: true,
          regras_validacao: true
        }
      },
      analises: {
        orderBy: { criado_em: "desc" },
        take: 1
      },
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

function campoObrigatorioPorTipo(tipo: string) {
  const campos: Record<string, string> = {
    cuidador: "obrigatorio_cuidador",
    enfermeiro: "obrigatorio_enfermeiro",
    acompanhante: "obrigatorio_acompanhante",
    baba: "obrigatorio_baba",
    diarista: "obrigatorio_diarista",
    motorista_assistencial: "obrigatorio_motorista_assistencial"
  };

  return campos[tipo];
}

async function recalcularStatusUsuario(usuarioId: string) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true }
  });
  if (!usuario) return null;

  const campoObrigatorio = campoObrigatorioPorTipo(usuario.tipo);
  const [documentos, obrigatorios] = await Promise.all([
    prisma.documentos_verificacao.findMany({
      where: { usuario_id: usuarioId },
      select: { tipo_documento: true, status: true }
    }),
    campoObrigatorio
      ? prisma.tipos_documentos.findMany({
          where: {
            ativo: true,
            requer_upload: true,
            obrigatorio_busca: true,
            [campoObrigatorio]: true
          },
          select: { codigo: true, categoria: true }
        })
      : Promise.resolve([])
  ]);

  const documentosAprovados = new Set(documentos.filter((doc) => doc.status === "aprovado").map((doc) => doc.tipo_documento));
  const obrigatoriosAtendidos = obrigatorios.every((tipo) => documentosAprovados.has(tipo.codigo));
  const obrigatoriosIdentidade = obrigatorios.filter((tipo) => tipo.categoria !== "profissional" && tipo.categoria !== "formacao");
  const obrigatoriosProfissionais = obrigatorios.filter((tipo) => tipo.categoria === "profissional" || tipo.categoria === "formacao");
  const identidadeAprovada =
    obrigatoriosIdentidade.length > 0 && obrigatoriosIdentidade.every((tipo) => documentosAprovados.has(tipo.codigo));
  const profissionalExigido = obrigatoriosProfissionais.length > 0;
  const profissionalAprovado =
    !profissionalExigido || obrigatoriosProfissionais.every((tipo) => documentosAprovados.has(tipo.codigo));
  const temRecusado = documentos.some((doc) => doc.status === "recusado");
  const temPendente = documentos.some((doc) => ["enviado", "em_validacao", "pendente_revisao"].includes(doc.status));

  const documentosStatus =
    obrigatorios.length > 0 && obrigatoriosAtendidos
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
