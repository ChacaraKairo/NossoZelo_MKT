-- Avaliacoes bilaterais, cancelamento sem custo e aceite legal do MVP.

ALTER TABLE `avaliacoes`
  DROP INDEX `contratacao_id`;

ALTER TABLE `avaliacoes`
  ADD COLUMN `autor_id` VARCHAR(20) NULL,
  ADD COLUMN `avaliado_id` VARCHAR(20) NULL,
  ADD COLUMN `tipo_autor` ENUM('cliente', 'prestador') NULL,
  ADD COLUMN `tipo_avaliacao` ENUM('cliente_para_prestador', 'prestador_para_cliente') NULL;

UPDATE `avaliacoes`
SET
  `autor_id` = `cliente_id`,
  `avaliado_id` = `prestador_id`,
  `tipo_autor` = 'cliente',
  `tipo_avaliacao` = 'cliente_para_prestador'
WHERE `autor_id` IS NULL;

ALTER TABLE `avaliacoes`
  MODIFY `autor_id` VARCHAR(20) NOT NULL,
  MODIFY `avaliado_id` VARCHAR(20) NOT NULL,
  MODIFY `tipo_autor` ENUM('cliente', 'prestador') NOT NULL,
  MODIFY `tipo_avaliacao` ENUM('cliente_para_prestador', 'prestador_para_cliente') NOT NULL,
  ADD UNIQUE INDEX `avaliacoes_contratacao_autor_unique` (`contratacao_id`, `autor_id`),
  ADD INDEX `avaliacoes_contratacao_id_idx` (`contratacao_id`),
  ADD INDEX `avaliacoes_autor_id_idx` (`autor_id`),
  ADD INDEX `avaliacoes_avaliado_id_idx` (`avaliado_id`);

ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `avaliacoes_contratacao_id_fkey`
  FOREIGN KEY (`contratacao_id`) REFERENCES `contratacoes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `avaliacoes_autor_id_fkey`
  FOREIGN KEY (`autor_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `avaliacoes_avaliado_id_fkey`
  FOREIGN KEY (`avaliado_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `contratacoes`
  MODIFY `status` ENUM('pendente', 'confirmado', 'concluido', 'paga', 'cancelado', 'nao_realizado', 'manual') NULL DEFAULT 'pendente',
  ADD COLUMN `cancelado_por` ENUM('cliente', 'prestador', 'admin') NULL,
  ADD COLUMN `motivo_cancelamento` TEXT NULL,
  ADD COLUMN `cancelado_em` TIMESTAMP NULL,
  ADD COLUMN `cancelamento_tardio` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `nao_realizado_motivo` VARCHAR(80) NULL,
  ADD COLUMN `nao_realizado_em` TIMESTAMP NULL;

ALTER TABLE `usuarios`
  ADD COLUMN `termos_aceitos_em` TIMESTAMP NULL,
  ADD COLUMN `termos_versao` VARCHAR(30) NULL,
  ADD COLUMN `privacidade_aceita_em` TIMESTAMP NULL,
  ADD COLUMN `privacidade_versao` VARCHAR(30) NULL,
  ADD COLUMN `cookies_aceitos_em` TIMESTAMP NULL,
  ADD COLUMN `cookies_versao` VARCHAR(30) NULL;
