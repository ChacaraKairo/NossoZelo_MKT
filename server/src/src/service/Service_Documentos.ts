import { documentos_verificacao_status, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '../lib/prisma';
import { TIPOS_PRESTADOR } from '../constants/dominio';
import { UsuarioAutenticado } from '../types/auth';
import { ManualDocumentVerificationProvider } from './ManualDocumentVerificationProvider';
import DocumentAnalysisService from './DocumentAnalysisService';

export const TIPOS_DOCUMENTO_PERMITIDOS = [
  'documento_identidade',
  'cpf',
  'cnh',
  'comprovante_residencia',
  'antecedentes_criminais_pf',
  'antecedentes_criminais_estadual',
  'comprovante_experiencia',
  'documento_profissional',
  'certificado_curso',
  'coren',
  'selfie',
  'termo_responsabilidade',
] as const;

type TipoDocumento = string;

const TIPOS_IDENTIDADE = new Set<string>([
  'documento_identidade',
  'cpf',
  'cnh',
  'selfie',
  'comprovante_residencia',
  'antecedentes_criminais_pf',
  'antecedentes_criminais_estadual',
]);

const TIPOS_PROFISSIONAIS = new Set<string>([
  'documento_profissional',
  'certificado_curso',
  'coren',
  'comprovante_experiencia',
]);

function usuarioEhPrestador(tipo?: string) {
  return Boolean(tipo && (TIPOS_PRESTADOR as readonly string[]).includes(tipo));
}

function normalizarTipoDocumento(tipo: unknown): TipoDocumento | null {
  if (typeof tipo !== 'string') return null;
  const codigo = tipo.trim();
  return codigo ? codigo : null;
}

export function sanitizeDocumentAuditPayload(input: unknown): unknown {
  const sensiveis = new Set([
    'cpf',
    'documento',
    'numero_documento',
    'rg',
    'cnh',
    'coren',
    'senha',
    'token',
    'authorization',
    'cookie',
    'api_key',
    'asaas_api_key',
    'aws_secret_access_key',
    'arquivo_base64',
    'selfie_base64',
    'payload_bruto',
  ]);

  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(sanitizeDocumentAuditPayload);

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [
      key,
      sensiveis.has(key.toLowerCase()) ? '[REDACTED]' : sanitizeDocumentAuditPayload(value),
    ]),
  );
}

export function prestadorPodeAparecerNaBusca(usuario: {
  documentos_status?: documentos_verificacao_status | string | null;
  identidade_status?: string | null;
  profissional_status?: string | null;
}) {
  return (
    usuario.documentos_status === 'aprovado' &&
    usuario.identidade_status === 'aprovada' &&
    ['aprovado', 'nao_aplicavel'].includes(usuario.profissional_status || 'nao_aplicavel')
  );
}

export function filtroDocumentacaoAprovadaSql() {
  return Prisma.sql`
    u.documentos_status = 'aprovado'::documentos_verificacao_status
    AND COALESCE(u.identidade_status, 'nao_iniciada') = 'aprovada'
    AND COALESCE(u.profissional_status, 'nao_aplicavel') IN ('aprovado', 'nao_aplicavel')
  `;
}

function diretorioDocumentos() {
  return process.env.DOCUMENTOS_UPLOAD_DIR || path.join(process.cwd(), 'private_uploads', 'documentos');
}

function extensaoSegura(arquivo: Express.Multer.File) {
  const extensao = path.extname(arquivo.originalname || '').toLowerCase();
  if (extensao) return extensao;
  if (arquivo.mimetype === 'application/pdf') return '.pdf';
  if (arquivo.mimetype === 'image/png') return '.png';
  if (arquivo.mimetype === 'image/webp') return '.webp';
  return '.jpg';
}

function campoObrigatorioPorTipo(tipo: string) {
  const campos: Record<string, string> = {
    cuidador: 'obrigatorio_cuidador',
    enfermeiro: 'obrigatorio_enfermeiro',
    acompanhante: 'obrigatorio_acompanhante',
    baba: 'obrigatorio_baba',
    diarista: 'obrigatorio_diarista',
    motorista_assistencial: 'obrigatorio_motorista_assistencial',
  };

  return campos[tipo];
}

function arquivoEhImagem(arquivo: Express.Multer.File) {
  return arquivo.mimetype.startsWith('image/');
}

function arquivoEhPdf(arquivo: Express.Multer.File) {
  return arquivo.mimetype === 'application/pdf';
}

async function salvarArquivoPrivado(usuarioId: string, tipoDocumento: TipoDocumento, arquivo: Express.Multer.File) {
  const baseDir = diretorioDocumentos();
  const usuarioDir = path.join(baseDir, usuarioId);
  await mkdir(usuarioDir, { recursive: true });

  const nomeArquivo = `${tipoDocumento}_${Date.now()}_${randomUUID()}${extensaoSegura(arquivo)}`;
  const destino = path.join(usuarioDir, nomeArquivo);
  await writeFile(destino, arquivo.buffer, { flag: 'wx' });

  return path.relative(process.cwd(), destino);
}

async function auditar(usuarioId: string | null, tabela: string, acao: 'INSERT' | 'UPDATE' = 'UPDATE') {
  try {
    await prisma.logs_acao.create({
      data: {
        usuario_id: usuarioId,
        tabela_afetada: tabela,
        acao,
      },
    });
  } catch {
    // Auditoria nao deve derrubar a operacao principal.
  }
}

async function recalcularStatusUsuario(usuarioId: string) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true },
  });

  if (!usuario) return null;

  const campoObrigatorio = campoObrigatorioPorTipo(usuario.tipo);
  const [documentos, obrigatorios] = await Promise.all([
    prisma.documentos_verificacao.findMany({
      where: { usuario_id: usuarioId },
      select: { tipo_documento: true, status: true },
    }),
    campoObrigatorio
      ? prisma.tipos_documentos.findMany({
          where: {
            ativo: true,
            requer_upload: true,
            obrigatorio_busca: true,
            [campoObrigatorio]: true,
          },
          select: { codigo: true, categoria: true },
        })
      : Promise.resolve([]),
  ]);

  const documentosAprovados = new Set(
    documentos.filter((doc) => doc.status === 'aprovado').map((doc) => doc.tipo_documento),
  );
  const obrigatoriosAtendidos = obrigatorios.every((tipo) =>
    documentosAprovados.has(tipo.codigo),
  );
  const obrigatoriosIdentidade = obrigatorios.filter(
    (tipo) => tipo.categoria !== 'profissional' && tipo.categoria !== 'formacao',
  );
  const obrigatoriosProfissionais = obrigatorios.filter(
    (tipo) => tipo.categoria === 'profissional' || tipo.categoria === 'formacao',
  );

  const identidadeAprovada =
    obrigatoriosIdentidade.length > 0 &&
    obrigatoriosIdentidade.every((tipo) => documentosAprovados.has(tipo.codigo));
  const profissionalExigido = obrigatoriosProfissionais.length > 0;
  const profissionalAprovado =
    !profissionalExigido ||
    obrigatoriosProfissionais.every((tipo) => documentosAprovados.has(tipo.codigo));
  const temRecusado = documentos.some((doc) => doc.status === 'recusado');
  const temPendente = documentos.some((doc) =>
    ['enviado', 'em_validacao', 'pendente_revisao'].includes(doc.status),
  );

  let documentosStatus: documentos_verificacao_status = 'nao_enviado';
  if (obrigatorios.length > 0 && obrigatoriosAtendidos) {
    documentosStatus = 'aprovado';
  } else if (temRecusado) {
    documentosStatus = 'recusado';
  } else if (temPendente || documentos.length > 0) {
    documentosStatus = 'pendente_revisao';
  }

  const atualizado = await prisma.usuarios.update({
    where: { id: usuarioId },
    data: {
      documentos_status: documentosStatus,
      identidade_status: identidadeAprovada ? 'aprovada' : temRecusado ? 'reprovada' : 'em_analise',
      profissional_status: profissionalExigido
        ? profissionalAprovado
          ? 'aprovado'
          : temRecusado
            ? 'reprovado'
            : 'pendente'
        : 'nao_aplicavel',
      documentos_revisado_em: new Date(),
    },
    select: {
      id: true,
      documentos_status: true,
      identidade_status: true,
      profissional_status: true,
    },
  });

  if (prestadorPodeAparecerNaBusca(atualizado)) {
    await auditar(usuarioId, 'prestador_liberado_por_documento');
  } else {
    await auditar(usuarioId, 'prestador_bloqueado_por_documento');
  }

  return atualizado;
}

export class ServiceDocumentos {
  private static provider = new ManualDocumentVerificationProvider();

  static async listarTiposParaPrestador(tipo: string) {
    const campoObrigatorio = campoObrigatorioPorTipo(tipo);
    if (!campoObrigatorio) return [];

    return prisma.tipos_documentos.findMany({
      where: {
        ativo: true,
        requer_upload: true,
        OR: [{ [campoObrigatorio]: true }, { obrigatorio_busca: false }],
      },
      orderBy: [{ obrigatorio_busca: 'desc' }, { categoria: 'asc' }, { nome: 'asc' }],
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        categoria: true,
        obrigatorio_busca: true,
        exige_revisao_manual: true,
        permite_pdf: true,
        permite_imagem: true,
        tamanho_maximo_mb: true,
        validade_dias: true,
        nivel_risco: true,
        campos_esperados: true,
        regras_validacao: true,
      },
    });
  }

  static async uploadDocumento(usuario: UsuarioAutenticado, tipo: unknown, arquivo?: Express.Multer.File) {
    if (!usuarioEhPrestador(usuario.tipo)) {
      throw new Error('Documentos de verificacao estao disponiveis apenas para prestadores.');
    }

    const tipoDocumento = normalizarTipoDocumento(tipo);
    if (!tipoDocumento) {
      throw new Error('Tipo de documento invalido.');
    }

    if (!arquivo) {
      throw new Error('Arquivo nao informado.');
    }

    const tipoCatalogo = await prisma.tipos_documentos.findUnique({
      where: { codigo: tipoDocumento },
    });

    if (!tipoCatalogo?.ativo) {
      throw new Error('Tipo de documento invalido ou inativo.');
    }

    if (!tipoCatalogo.requer_upload) {
      throw new Error('Este tipo de documento usa aceite digital e nao aceita upload.');
    }

    if (arquivoEhPdf(arquivo) && !tipoCatalogo.permite_pdf) {
      throw new Error('Este tipo de documento nao aceita PDF.');
    }

    if (arquivoEhImagem(arquivo) && !tipoCatalogo.permite_imagem) {
      throw new Error('Este tipo de documento nao aceita imagem.');
    }

    const maxBytes = tipoCatalogo.tamanho_maximo_mb * 1024 * 1024;
    if (maxBytes > 0 && arquivo.size > maxBytes) {
      throw new Error(`Arquivo excede o limite de ${tipoCatalogo.tamanho_maximo_mb}MB para este documento.`);
    }

    await auditar(usuario.id, 'documento_upload_iniciado', 'INSERT');
    const arquivoChave = await salvarArquivoPrivado(usuario.id, tipoDocumento, arquivo);

    const documento = await prisma.documentos_verificacao.create({
      data: {
        usuario_id: usuario.id,
        tipo_documento_id: tipoCatalogo.id,
        tipo_documento: tipoDocumento,
        arquivo_chave: arquivoChave,
        mime_type: arquivo.mimetype,
        tamanho_bytes: arquivo.size,
        status: 'enviado',
      },
    });

    const resultado = await this.provider.verifyDocument({
      usuarioId: usuario.id,
      documentoId: documento.id,
      tipoDocumento,
      arquivoChave,
      mimeType: arquivo.mimetype,
    });

    const atualizado = await prisma.documentos_verificacao.update({
      where: { id: documento.id },
      data: {
        status: resultado.status === 'erro' ? 'pendente_revisao' : resultado.status,
        provedor: resultado.provider,
        score: resultado.score,
        motivo_recusa: resultado.motivo,
        dados_extraidos: sanitizeDocumentAuditPayload(resultado.dadosExtraidos) as Prisma.InputJsonValue,
        resultado_resumo: sanitizeDocumentAuditPayload(resultado.resultadoResumo) as Prisma.InputJsonValue,
      },
    });
    const analise = await DocumentAnalysisService.analisarDocumento(documento.id);

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        documentos_status: 'pendente_revisao',
        identidade_status: TIPOS_IDENTIDADE.has(tipoDocumento) ? 'em_analise' : undefined,
        profissional_status: TIPOS_PROFISSIONAIS.has(tipoDocumento) ? 'pendente' : undefined,
      },
    });

    await auditar(usuario.id, 'documento_upload_concluido', 'INSERT');
    await auditar(usuario.id, 'documento_enviado_para_revisao', 'UPDATE');

    return { ...atualizado, analise };
  }

  static async obterStatus(usuario: UsuarioAutenticado) {
    const [prestador, documentos, tiposDocumentos] = await Promise.all([
      prisma.usuarios.findUnique({
        where: { id: usuario.id },
        select: {
          id: true,
          documentos_status: true,
          identidade_status: true,
          profissional_status: true,
          documentos_revisado_em: true,
        },
      }),
      prisma.documentos_verificacao.findMany({
        where: { usuario_id: usuario.id },
        orderBy: { criado_em: 'desc' },
        select: {
          id: true,
          tipo_documento: true,
          status: true,
          provedor: true,
          score: true,
          motivo_recusa: true,
          criado_em: true,
          atualizado_em: true,
          tipoDocumento: {
            select: {
              codigo: true,
              nome: true,
              categoria: true,
              obrigatorio_busca: true,
            },
          },
          analises: {
            orderBy: { criado_em: 'desc' },
            take: 1,
            select: {
              sinal: true,
              score: true,
              status: true,
              precisa_revisao: true,
              motivo: true,
              pendencias: true,
              criado_em: true,
            },
          },
        },
      }),
      this.listarTiposParaPrestador(usuario.tipo),
    ]);

    if (!prestador) throw new Error('Usuario nao encontrado.');
    await auditar(usuario.id, 'documento_status_consultado');

    return {
      ...prestador,
      documentosStatus: prestador.documentos_status,
      identidadeStatus: prestador.identidade_status,
      profissionalStatus: prestador.profissional_status,
      podeAparecerNaBusca: prestadorPodeAparecerNaBusca(prestador),
      tiposDocumentos,
      documentos: documentos.map((documento) => ({
        ...documento,
        tipoDocumento: documento.tipo_documento,
        tipoDocumentoNome: documento.tipoDocumento?.nome || documento.tipo_documento,
        analise: documento.analises[0] || null,
        criadoEm: documento.criado_em,
        atualizadoEm: documento.atualizado_em,
      })),
    };
  }

  static async listarPendentes() {
    return prisma.documentos_verificacao.findMany({
      where: { status: { in: ['enviado', 'em_validacao', 'pendente_revisao'] } },
      orderBy: { criado_em: 'asc' },
      include: {
        tipoDocumento: {
          select: { codigo: true, nome: true, categoria: true, obrigatorio_busca: true },
        },
        usuarios: {
          select: { id: true, nome: true, email: true, tipo: true, documentos_status: true },
        },
      },
    });
  }

  static async detalhar(documentoId: number) {
    const documento = await prisma.documentos_verificacao.findUnique({
      where: { id: documentoId },
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            documentos_status: true,
            identidade_status: true,
            profissional_status: true,
          },
        },
        tipoDocumento: {
          select: {
            codigo: true,
            nome: true,
            categoria: true,
            obrigatorio_busca: true,
            campos_esperados: true,
            regras_validacao: true,
          },
        },
        analises: {
          orderBy: { criado_em: 'desc' },
          take: 1,
        },
        revisoes: { orderBy: { criado_em: 'desc' } },
      },
    });

    if (!documento) throw new Error('Documento nao encontrado.');
    return documento;
  }

  static async aprovar(admin: UsuarioAutenticado, documentoId: number, motivo: string) {
    if (!motivo?.trim()) throw new Error('Motivo obrigatorio para aprovacao manual.');
    const documento = await this.detalhar(documentoId);

    const atualizado = await prisma.documentos_verificacao.update({
      where: { id: documentoId },
      data: { status: 'aprovado', motivo_recusa: null },
    });

    await prisma.revisoes_documentos.create({
      data: {
        documento_id: documentoId,
        usuario_id: documento.usuario_id,
        admin_id: admin.id,
        decisao: 'aprovado',
        motivo: motivo.trim(),
      },
    });

    const statusUsuario = await recalcularStatusUsuario(documento.usuario_id);
    await auditar(admin.id, 'documento_aprovado_admin');
    return { documento: atualizado, statusUsuario };
  }

  static async recusar(admin: UsuarioAutenticado, documentoId: number, motivo: string) {
    if (!motivo?.trim()) throw new Error('Motivo obrigatorio para recusa manual.');
    const documento = await this.detalhar(documentoId);

    const atualizado = await prisma.documentos_verificacao.update({
      where: { id: documentoId },
      data: { status: 'recusado', motivo_recusa: motivo.trim() },
    });

    await prisma.revisoes_documentos.create({
      data: {
        documento_id: documentoId,
        usuario_id: documento.usuario_id,
        admin_id: admin.id,
        decisao: 'recusado',
        motivo: motivo.trim(),
      },
    });

    const statusUsuario = await recalcularStatusUsuario(documento.usuario_id);
    await auditar(admin.id, 'documento_recusado_admin');
    return { documento: atualizado, statusUsuario };
  }

  static async reprocessar(usuario: UsuarioAutenticado, documentoId: number) {
    const documento = await prisma.documentos_verificacao.findUnique({
      where: { id: documentoId },
    });

    if (!documento || (documento.usuario_id !== usuario.id && usuario.tipo !== 'admin')) {
      throw new Error('Documento nao encontrado.');
    }

    const atualizado = await prisma.documentos_verificacao.update({
      where: { id: documentoId },
      data: { status: 'pendente_revisao', provedor: this.provider.name },
    });

    await prisma.usuarios.update({
      where: { id: documento.usuario_id },
      data: { documentos_status: 'pendente_revisao' },
    });
    await auditar(usuario.id, 'documento_reprocessado');
    return atualizado;
  }

  static async reanalisar(usuario: UsuarioAutenticado, documentoId: number) {
    const documento = await prisma.documentos_verificacao.findUnique({
      where: { id: documentoId },
    });

    if (!documento || (documento.usuario_id !== usuario.id && usuario.tipo !== 'admin')) {
      throw new Error('Documento nao encontrado.');
    }

    const analise = await DocumentAnalysisService.analisarDocumento(documentoId);
    await prisma.documentos_verificacao.update({
      where: { id: documentoId },
      data: { status: analise.status as documentos_verificacao_status },
    });
    await prisma.usuarios.update({
      where: { id: documento.usuario_id },
      data: { documentos_status: 'pendente_revisao' },
    });
    await auditar(usuario.id, 'documento_reanalisado');
    return analise;
  }

  static async obterAnalise(usuario: UsuarioAutenticado, documentoId: number) {
    const documento = await prisma.documentos_verificacao.findUnique({
      where: { id: documentoId },
      select: { id: true, usuario_id: true },
    });

    if (!documento || (documento.usuario_id !== usuario.id && usuario.tipo !== 'admin')) {
      throw new Error('Documento nao encontrado.');
    }

    const analise = await DocumentAnalysisService.obterAnaliseMaisRecente(documentoId);
    if (!analise) throw new Error('Analise nao encontrada.');
    return analise;
  }
}

export default ServiceDocumentos;
