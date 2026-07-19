import { z } from 'zod';

const textoCurto = z.string().trim().min(1).max(255);
const senha = z.string().min(8).max(72);
const idTexto = z.string().trim().min(1).max(40);
const dataIso = z.string().trim().min(8).max(40);
const hora = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Horario deve usar HH:mm ou HH:mm:ss.');

export const loginSchema = z
  .object({
    identificador: textoCurto,
    senha: z.string().min(1).max(72),
  })
  .strict();

export const solicitarRecuperacaoSenhaSchema = z
  .object({
    email: z.string().trim().email().max(255),
  })
  .strict();

export const validarTokenRecuperacaoQuerySchema = z
  .object({
    token: textoCurto,
  })
  .strict();

export const redefinirSenhaSchema = z
  .object({
    token: textoCurto,
    novaSenha: senha,
  })
  .strict();

const creditCardSchema = z
  .object({
    holderName: textoCurto,
    number: z.string().trim().min(12).max(19),
    expiryMonth: z.string().trim().min(1).max(2),
    expiryYear: z.string().trim().min(2).max(4),
    ccv: z.string().trim().min(3).max(4),
  })
  .strict();

const creditCardHolderInfoSchema = z
  .object({
    name: textoCurto,
    email: z.string().trim().email().max(255),
    cpfCnpj: z.string().trim().min(11).max(18),
    postalCode: z.string().trim().min(8).max(10),
    addressNumber: z.string().trim().min(1).max(20),
    addressComplement: z.string().trim().max(100).nullable().optional(),
    phone: z.string().trim().min(8).max(20).optional(),
    mobilePhone: z.string().trim().min(8).max(20).optional(),
  })
  .strict();

const dadosPagamentoSchema = z
  .object({
    metodoPagamento: z
      .enum(['credit_card', 'asaas_invoice', 'pix', 'boleto'])
      .optional(),
    creditCard: creditCardSchema.optional(),
    creditCardHolderInfo: creditCardHolderInfoSchema.optional(),
    creditCardToken: textoCurto.optional(),
  })
  .strict();

export const assinaturaSchema = z
  .object({
    planoId: z.coerce.number().int().positive().optional(),
    plano_id: z.coerce.number().int().positive().optional(),
    dadosPagamento: dadosPagamentoSchema.optional(),
  })
  .strict()
  .refine((data) => data.planoId || data.plano_id, {
    message: 'Informe um plano valido.',
    path: ['planoId'],
  });

export const webhookAsaasSchema = z
  .object({
    event: textoCurto.optional(),
    payment: z.record(z.string(), z.unknown()).optional(),
    subscription: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const agendamentoCriarSchema = z
  .object({
    prestador_id: idTexto,
    servico_id: z.coerce.number().int().positive(),
    data: dataIso,
    hora_inicio: hora,
    hora_fim: hora.optional(),
    observacoes: z.string().trim().max(1000).optional(),
    observacao: z.string().trim().max(1000).optional(),
  })
  .strict();

export const agendamentoCancelarSchema = z
  .object({
    motivo: z.string().trim().max(1000).optional(),
    motivo_cancelamento: z.string().trim().max(1000).optional(),
  })
  .strict();

export const agendamentoNaoRealizadoSchema = z
  .object({
    motivo: z.string().trim().min(3).max(1000).optional(),
    nao_realizado_motivo: z.string().trim().min(3).max(80).optional(),
  })
  .strict();

export const agendamentoManualSchema = z
  .object({
    cliente_id: idTexto,
    servico_id: z.coerce.number().int().positive().optional(),
    tipo_prestador: z.enum(['cuidador', 'enfermeiro', 'acompanhante']).optional(),
    data: dataIso,
    hora_inicio: hora,
    hora_fim: hora.optional(),
    preco: z.coerce.number().positive().optional(),
    observacoes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const uploadCadastroBodySchema = z
  .object({
    usuarioId: idTexto,
    sessionId: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

export const cadastroTopLevelSchema = z
  .object({
    usuario: z.record(z.string(), z.unknown()),
    cuidador: z.record(z.string(), z.unknown()).optional(),
    enfermeiro: z.record(z.string(), z.unknown()).optional(),
    acompanhante: z.record(z.string(), z.unknown()).optional(),
    admin: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();
