ALTER TABLE `usuarios`
ADD COLUMN `status_cadastro` ENUM(
  'ativo',
  'pendente_pagamento',
  'aguardando_confirmacao_pagamento',
  'inadimplente',
  'bloqueado',
  'cancelado'
) NOT NULL DEFAULT 'ativo';

ALTER TABLE `assinaturas`
ADD COLUMN `status` ENUM(
  'pendente',
  'aguardando_confirmacao',
  'ativa',
  'atrasada',
  'bloqueada',
  'cancelada',
  'falhou',
  'expirada'
) NOT NULL DEFAULT 'pendente',
ADD COLUMN `gateway` VARCHAR(30) NOT NULL DEFAULT 'mock',
ADD COLUMN `gateway_customer_id` VARCHAR(120) NULL,
ADD COLUMN `gateway_subscription_id` VARCHAR(120) NULL,
ADD COLUMN `gateway_status` VARCHAR(60) NULL,
ADD COLUMN `data_ultimo_pagamento` TIMESTAMP(0) NULL,
ADD COLUMN `data_proximo_vencimento` TIMESTAMP(0) NULL,
ADD COLUMN `periodo_tolerancia_ate` TIMESTAMP(0) NULL,
ADD COLUMN `confirmacao_expira_em` TIMESTAMP(0) NULL,
ADD COLUMN `cancelada_em` TIMESTAMP(0) NULL,
ADD COLUMN `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
ADD COLUMN `atualizado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);
