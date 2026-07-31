ALTER TABLE `recuperacao_senhas`
DROP FOREIGN KEY `recuperacao_senhas_ibfk_1`;

ALTER TABLE `recuperacao_senhas`
ADD CONSTRAINT `recuperacao_senhas_ibfk_1`
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
ON DELETE CASCADE
ON UPDATE NO ACTION;
