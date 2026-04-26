import {
  contratacoes_status,
  servicos_tipo_cobranca,
  servicos_tipo_prestador,
  usuarios_tipo,
} from '@prisma/client';

export const TIPOS_PRESTADOR = [
  'cuidador',
  'enfermeiro',
  'acompanhante',
] satisfies usuarios_tipo[];

export const STATUS_CONTRATACAO = {
  pendente: 'pendente',
  confirmado: 'confirmado',
  concluido: 'concluido',
  paga: 'paga',
  cancelado: 'cancelado',
  manual: 'manual',
} satisfies Record<string, contratacoes_status>;

export const STATUS_PRIVACY_GATE_CLIENTE = [
  STATUS_CONTRATACAO.confirmado,
  STATUS_CONTRATACAO.concluido,
] satisfies contratacoes_status[];

export const TIPOS_COBRANCA_SERVICO = [
  'hora',
  'dia',
] satisfies servicos_tipo_cobranca[];

export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];
export type TipoCobrancaServico = (typeof TIPOS_COBRANCA_SERVICO)[number];
export type TipoPrestadorServico = servicos_tipo_prestador;
