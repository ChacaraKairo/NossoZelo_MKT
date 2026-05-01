CREATE TABLE `confirmacoes_email` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` VARCHAR(20) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expiracao` TIMESTAMP(0) NOT NULL,
  `usado` BOOLEAN NOT NULL DEFAULT false,
  `criado_em` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

  UNIQUE INDEX `confirmacoes_email_token_key`(`token`),
  INDEX `confirmacoes_email_usuario_id_idx`(`usuario_id`),
  INDEX `confirmacoes_email_token_idx`(`token`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `confirmacoes_email`
ADD CONSTRAINT `confirmacoes_email_usuario_id_fkey`
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
