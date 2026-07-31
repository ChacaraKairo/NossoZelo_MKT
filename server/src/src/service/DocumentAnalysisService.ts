import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

type ValidacaoDocumento = {
  codigo: string;
  status: 'ok' | 'alerta' | 'erro';
  mensagem: string;
  pesoErro: number;
  pesoAlerta: number;
};

function sanitizeAnalysisPayload(input: unknown): unknown {
  const sensiveis = new Set(['cpf', 'rg', 'cnh', 'coren', 'token', 'authorization', 'cookie']);
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(sanitizeAnalysisPayload);

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [
      key,
      sensiveis.has(key.toLowerCase()) ? '[REDACTED]' : sanitizeAnalysisPayload(value),
    ]),
  );
}

function calcularScore(validacoes: ValidacaoDocumento[]) {
  const score = Math.max(
    0,
    validacoes.reduce((atual, validacao) => {
      if (validacao.status === 'erro') return atual - validacao.pesoErro;
      if (validacao.status === 'alerta') return atual - validacao.pesoAlerta;
      return atual;
    }, 100),
  );

  if (score >= 85) return { score, sinal: 'verde' };
  if (score >= 60) return { score, sinal: 'amarelo' };
  return { score, sinal: 'vermelho' };
}

export class DocumentAnalysisService {
  static async analisarDocumento(documentoId: number) {
    const documento = await prisma.documentos_verificacao.findUnique({
      where: { id: documentoId },
      include: {
        usuarios: {
          select: { id: true, nome: true, cpf: true, tipo: true },
        },
        tipoDocumento: true,
      },
    });

    if (!documento) {
      throw new Error('Documento nao encontrado para analise.');
    }

    const tipoDetectado = documento.tipoDocumento?.codigo || documento.tipo_documento;
    const validacoes: ValidacaoDocumento[] = [
      {
        codigo: 'arquivo_recebido',
        status: 'ok',
        mensagem: 'Arquivo recebido e salvo em storage privado.',
        pesoErro: 40,
        pesoAlerta: 10,
      },
      {
        codigo: 'tipo_documental_catalogado',
        status: documento.tipoDocumento ? 'ok' : 'alerta',
        mensagem: documento.tipoDocumento
          ? 'Tipo documental existe no catalogo interno.'
          : 'Tipo documental nao possui vinculo com catalogo.',
        pesoErro: 30,
        pesoAlerta: 15,
      },
      {
        codigo: 'ocr_nao_configurado',
        status: 'alerta',
        mensagem: 'OCR/provider externo ainda nao configurado; documento precisa de revisao manual.',
        pesoErro: 40,
        pesoAlerta: 30,
      },
    ];

    const { score, sinal } = calcularScore(validacoes);
    const status = sinal === 'vermelho' ? 'recusado' : 'pendente_revisao';
    const pendencias =
      sinal === 'verde'
        ? []
        : ['Documento precisa de revisao manual enquanto OCR/provider externo nao estiver configurado.'];

    const dadosExtraidos = sanitizeAnalysisPayload({
      tipoDocumentoDetectado: tipoDetectado,
      nomeCadastro: documento.usuarios.nome,
      cpf: documento.usuarios.cpf,
      fonte: 'manual_mvp',
    });

    return prisma.documentos_analises.create({
      data: {
        documento_id: documento.id,
        usuario_id: documento.usuario_id,
        tipo_detectado: tipoDetectado,
        sinal,
        score,
        status,
        arquivo_legivel: false,
        tipo_confere: Boolean(documento.tipoDocumento),
        nome_confere: false,
        cpf_confere: false,
        validade_confere: null,
        precisa_revisao: sinal !== 'verde',
        dados_extraidos: dadosExtraidos as Prisma.InputJsonValue,
        validacoes: validacoes as unknown as Prisma.InputJsonValue,
        pendencias: pendencias as unknown as Prisma.InputJsonValue,
        motivo: 'Analise automatica basica registrada; aguardando revisao manual.',
        provider: 'manual_mvp',
      },
    });
  }

  static async obterAnaliseMaisRecente(documentoId: number) {
    return prisma.documentos_analises.findFirst({
      where: { documento_id: documentoId },
      orderBy: { criado_em: 'desc' },
    });
  }
}

export default DocumentAnalysisService;
