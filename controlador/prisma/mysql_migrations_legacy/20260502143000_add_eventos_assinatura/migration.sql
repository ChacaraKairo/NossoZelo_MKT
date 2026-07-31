CREATE TABLE `eventos_assinatura` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `assinatura_id` INTEGER NULL,
  `prestador_id` VARCHAR(20) NULL,
  `plano_id` INTEGER NULL,
  `tipo` VARCHAR(80) NOT NULL,
  `origem` VARCHAR(40) NOT NULL DEFAULT 'sistema',
  `gateway` VARCHAR(30) NULL,
  `gateway_event_id` VARCHAR(191) NULL,
  `gateway_payment_id` VARCHAR(120) NULL,
  `gateway_subscription_id` VARCHAR(120) NULL,
  `status_anterior` VARCHAR(40) NULL,
  `status_novo` VARCHAR(40) NULL,
  `valor` DECIMAL(10, 2) NULL,
  `payload_resumo` JSON NULL,
  `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

  UNIQUE INDEX `eventos_assinatura_gateway_event_id_key`(`gateway_event_id`),
  INDEX `eventos_assinatura_assinatura_id_idx`(`assinatura_id`),
  INDEX `eventos_assinatura_prestador_id_idx`(`prestador_id`),
  INDEX `eventos_assinatura_tipo_idx`(`tipo`),
  INDEX `eventos_assinatura_gateway_subscription_id_idx`(`gateway_subscription_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `eventos_assinatura`
  ADD CONSTRAINT `eventos_assinatura_assinatura_id_fkey`
  FOREIGN KEY (`assinatura_id`) REFERENCES `assinaturas`(`id`)
  ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `eventos_assinatura`
  ADD CONSTRAINT `eventos_assinatura_prestador_id_fkey`
  FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`)
  ON DELETE SET NULL ON UPDATE NO ACTION;
