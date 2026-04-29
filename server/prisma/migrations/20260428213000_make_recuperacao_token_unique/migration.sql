ALTER TABLE `recuperacao_senhas`
ADD UNIQUE INDEX `recuperacao_senhas_token_key`(`token`);
