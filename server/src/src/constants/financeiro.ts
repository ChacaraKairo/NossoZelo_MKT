import {
  assinaturas_status,
  usuarios_status_cadastro,
} from '@prisma/client';

export const STATUS_ASSINATURA = {
  pendente: 'pendente',
  aguardando_confirmacao: 'aguardando_confirmacao',
  ativa: 'ativa',
  atrasada: 'atrasada',
  bloqueada: 'bloqueada',
  cancelada: 'cancelada',
  falhou: 'falhou',
  expirada: 'expirada',
} satisfies Record<string, assinaturas_status>;

export const STATUS_CADASTRO_USUARIO = {
  ativo: 'ativo',
  pendente_pagamento: 'pendente_pagamento',
  aguardando_confirmacao_pagamento: 'aguardando_confirmacao_pagamento',
  inadimplente: 'inadimplente',
  bloqueado: 'bloqueado',
  cancelado: 'cancelado',
} satisfies Record<string, usuarios_status_cadastro>;

export const HORAS_CONFIRMACAO_PAGAMENTO = 72;
export const DIAS_TOLERANCIA_ASSINATURA = 15;

export const GATEWAY_PAGAMENTO = {
  asaas: 'asaas',
} as const;

export type GatewayPagamento =
  (typeof GATEWAY_PAGAMENTO)[keyof typeof GATEWAY_PAGAMENTO];
