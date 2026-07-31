ALTER TABLE `eventos_assinatura`
  ADD COLUMN `payload_hash` VARCHAR(64) NULL,
  ADD COLUMN `processado_em` TIMESTAMP(0) NULL;

CREATE INDEX `eventos_assinatura_payload_hash_idx` ON `eventos_assinatura`(`payload_hash`);
