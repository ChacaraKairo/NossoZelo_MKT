/*
  Warnings:

  - You are about to drop the column `cuidador_id` on the `agenda_recorrente` table. All the data in the column will be lost.
  - You are about to drop the column `cuidador_id` on the `assinaturas` table. All the data in the column will be lost.
  - Added the required column `prestador_id` to the `agenda_recorrente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prestador_id` to the `assinaturas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `agenda_recorrente` DROP FOREIGN KEY `agenda_recorrente_ibfk_1`;

-- DropForeignKey
ALTER TABLE `assinaturas` DROP FOREIGN KEY `assinaturas_ibfk_1`;

-- DropForeignKey
ALTER TABLE `cartoes` DROP FOREIGN KEY `cartoes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `cuidador_especialidade` DROP FOREIGN KEY `cuidador_especialidade_ibfk_1`;

-- DropForeignKey
ALTER TABLE `documentos_cuidadores` DROP FOREIGN KEY `documentos_cuidadores_ibfk_1`;

-- DropIndex
DROP INDEX `cuidador_id` ON `agenda_recorrente`;

-- DropIndex
DROP INDEX `cuidador_id` ON `assinaturas`;

-- AlterTable
ALTER TABLE `agenda_recorrente` DROP COLUMN `cuidador_id`,
    ADD COLUMN `prestador_id` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `assinaturas` DROP COLUMN `cuidador_id`,
    ADD COLUMN `prestador_id` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `avaliacoes` MODIFY `tipo_prestador` ENUM('cuidador', 'enfermeiro', 'acompanhante') NOT NULL;

-- AlterTable
ALTER TABLE `cuidadores` ADD COLUMN `documentos` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `enfermeiros` ADD COLUMN `avaliacao_media` DECIMAL(3, 2) NULL DEFAULT 0.00,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `documentos` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `acompanhantes` (
    `usuario_id` VARCHAR(20) NOT NULL,
    `bio` TEXT NULL,
    `anos_experiencia` INTEGER NULL,
    `avaliacao_media` DECIMAL(3, 2) NULL DEFAULT 0.00,
    `documentos` VARCHAR(255) NULL,

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `prestador_id` ON `agenda_recorrente`(`prestador_id`);

-- CreateIndex
CREATE INDEX `prestador_id` ON `assinaturas`(`prestador_id`);

-- AddForeignKey
ALTER TABLE `agenda_recorrente` ADD CONSTRAINT `agenda_recorrente_prestador_id_fkey` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_prestador_id_fkey` FOREIGN KEY (`prestador_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cuidador_especialidade` ADD CONSTRAINT `cuidador_especialidade_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documentos_cuidadores` ADD CONSTRAINT `documentos_cuidadores_ibfk_1` FOREIGN KEY (`cuidador_id`) REFERENCES `cuidadores`(`usuario_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `acompanhantes` ADD CONSTRAINT `acompanhantes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cartoes` ADD CONSTRAINT `cartoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
