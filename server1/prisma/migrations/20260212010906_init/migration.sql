-- CreateTable
CREATE TABLE `admins` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `cargo` VARCHAR(100) NULL DEFAULT 'Administrador do sistema',
    `permissao_total` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestador_id` VARCHAR(20) NOT NULL,
    `tipo_prestador` ENUM('cuidador', 'enfermeiro', 'acompanhante') NOT NULL,
    `data` DATE NOT NULL,
    `hora_inicio` TIME(0) NOT NULL,
    `hora_fim` TIME(0) NOT NULL,
    `observacoes` TEXT NULL,
    `servico_realizado` BOOLEAN NULL DEFAULT false,
    `status` ENUM('disponivel', 'ocupado', 'indisponivel') NULL DEFAULT 'disponivel',

    INDEX `prestador_id`(`prestador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agenda_recorrente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuidador_id` VARCHAR(20) NOT NULL,
    `dia_semana` ENUM('domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado') NULL,
    `hora_inicio` TIME(0) NOT NULL,
    `hora_fim` TIME(0) NOT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,

    INDEX `cuidador_id`(`cuidador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assinaturas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuidador_id` VARCHAR(20) NOT NULL,
    `plano_id` INTEGER NOT NULL,
    `data_inicio` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `data_fim` TIMESTAMP(0) NULL,

    INDEX `cuidador_id`(`cuidador_id`),
    INDEX `plano_id`(`plano_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` VARCHAR(20) NOT NULL,
    `prestador_id` VARCHAR(20) NOT NULL,
    `tipo_prestador` ENUM('cuidador', 'enfermeiro') NOT NULL,
    `nota` INTEGER NULL,
    `comentario` TEXT NULL,
    `data_avaliacao` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `cliente_id`(`cliente_id`),
    INDEX `prestador_id`(`prestador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contratacoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cliente_id` VARCHAR(20) NOT NULL,
    `prestador_id` VARCHAR(20) NOT NULL,
    `tipo_prestador` ENUM('cuidador', 'enfermeiro', 'acompanhante') NOT NULL,
    `data` DATE NOT NULL,
    `hora_inicio` TIME(0) NOT NULL,
    `hora_fim` TIME(0) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pendente', 'confirmado', 'concluido', 'paga', 'cancelado') NULL DEFAULT 'pendente',
    `observacoes` TEXT NULL,

    INDEX `cliente_id`(`cliente_id`),
    INDEX `prestador_id`(`prestador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuidador_especialidade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuidador_id` VARCHAR(20) NOT NULL,
    `especialidade_id` INTEGER NOT NULL,

    INDEX `cuidador_id`(`cuidador_id`),
    INDEX `especialidade_id`(`especialidade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuidadores` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `bio` TEXT NULL,
    `anos_experiencia` INTEGER NULL,
    `avaliacao_media` DECIMAL(3, 2) NULL DEFAULT 0.00,
    `documento_profissional` VARCHAR(50) NULL,
    `conta_bancaria` VARCHAR(50) NULL,

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `denuncias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('pendente', 'resolvido') NULL DEFAULT 'pendente',

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_cuidadores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cuidador_id` VARCHAR(20) NOT NULL,
    `tipo` VARCHAR(100) NOT NULL,
    `url_arquivo` VARCHAR(255) NOT NULL,

    INDEX `cuidador_id`(`cuidador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enfermeiros` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `coren` VARCHAR(20) NOT NULL,
    `especialidade` VARCHAR(100) NULL,
    `anos_experiencia` INTEGER NULL,

    UNIQUE INDEX `coren`(`coren`),
    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `especialidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NOT NULL,
    `descricao` TEXT NULL,
    `valor` DECIMAL(10, 2) NULL,
    `vencimento` DATE NULL,
    `pago` BOOLEAN NULL DEFAULT false,
    `data_pagamento` TIMESTAMP(0) NULL,

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_acao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NULL,
    `tabela_afetada` VARCHAR(100) NULL,
    `acao` ENUM('INSERT', 'UPDATE', 'DELETE') NULL,
    `data` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_acesso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NOT NULL,
    `data_hora` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ip` VARCHAR(45) NULL,

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodos_pagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `servico_id` INTEGER NOT NULL,
    `metodo_pagamento_id` INTEGER NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pendente', 'pago', 'falhou') NULL DEFAULT 'pendente',
    `data_pagamento` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `metodo_pagamento_id`(`metodo_pagamento_id`),
    INDEX `servico_id`(`servico_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `beneficios` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recuperacao_senhas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expiracao` TIMESTAMP(0) NOT NULL,
    `usado` BOOLEAN NULL DEFAULT false,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `relatorios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` VARCHAR(20) NOT NULL,
    `tipo` ENUM('financeiro', 'usuarios', 'avaliacoes', 'servicos') NOT NULL,
    `periodo_inicio` DATE NULL,
    `periodo_fim` DATE NULL,
    `gerado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `admin_id`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestador_id` VARCHAR(20) NOT NULL,
    `tipo_prestador` ENUM('cuidador', 'enfermeiro', 'acompanhante') NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `tipo_cobranca` ENUM('hora', 'dia') NOT NULL,

    INDEX `prestador_id`(`prestador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(20) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `sexo` ENUM('masculino', 'feminino', 'outro') NULL DEFAULT 'outro',
    `data_nascimento` DATE NULL,
    `cep` VARCHAR(10) NOT NULL,
    `endereco` VARCHAR(255) NULL,
    `cidade` VARCHAR(100) NULL,
    `estado` VARCHAR(50) NULL,
    `pais` VARCHAR(50) NULL DEFAULT 'Brasil',
    `url_foto_perfil` VARCHAR(255) NULL,
    `tipo` ENUM('cliente', 'cuidador', 'enfermeiro', 'acompanhante', 'admin') NOT NULL,
    `email_confirmado` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `cpf`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` VARCHAR(20) NOT NULL,
    `nome_titular` VARCHAR(100) NULL,
    `numero_mascarado` VARCHAR(20) NULL,
    `validade_mes` INTEGER NULL,
    `validade_ano` INTEGER NULL,
    `bandeira` VARCHAR(50) NULL,
    `tipo` ENUM('credito', 'debito') NOT NULL DEFAULT 'credito',
    `token_gateway` VARCHAR(255) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dados_bancarios` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `banco` VARCHAR(100) NOT NULL,
    `agencia` VARCHAR(20) NOT NULL,
    `conta` VARCHAR(30) NOT NULL,
    `tipo_conta` ENUM('corrente', 'poupanca', 'salario', 'investimento') NULL DEFAULT 'corrente',
    `nome_titular` VARCHAR(100) NOT NULL,
    `cpf_titular` VARCHAR(14) NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localizacoes` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `latitude` DECIMAL(9, 6) NULL,
    `longitude` DECIMAL(9, 6) NULL,

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agenda` ADD CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agenda_recorrente` ADD CONSTRAINT `agenda_recorrente_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_ibfk_2` FOREIGN KEY (`plano_id`) REFERENCES `planos`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `avaliacoes` ADD CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contratacoes` ADD CONSTRAINT `contratacoes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contratacoes` ADD CONSTRAINT `contratacoes_ibfk_2` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cuidador_especialidade` ADD CONSTRAINT `cuidador_especialidade_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cuidador_especialidade` ADD CONSTRAINT `cuidador_especialidade_ibfk_2` FOREIGN KEY (`especialidade_id`) REFERENCES `especialidades`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cuidadores` ADD CONSTRAINT `cuidadores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `denuncias` ADD CONSTRAINT `denuncias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documentos_cuidadores` ADD CONSTRAINT `documentos_cuidadores_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `enfermeiros` ADD CONSTRAINT `enfermeiros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `faturas` ADD CONSTRAINT `faturas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_acao` ADD CONSTRAINT `logs_acao_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `logs_acesso` ADD CONSTRAINT `logs_acesso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`servico_id`) REFERENCES `contratacoes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_ibfk_2` FOREIGN KEY (`metodo_pagamento_id`) REFERENCES `metodos_pagamento`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `recuperacao_senhas` ADD CONSTRAINT `recuperacao_senhas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `servicos` ADD CONSTRAINT `servicos_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cartoes` ADD CONSTRAINT `cartoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `dados_bancarios` ADD CONSTRAINT `dados_bancarios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `localizacoes` ADD CONSTRAINT `fk_localizacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
