/*
  Warnings:

  - You are about to drop the column `cuidador_id` on the `documentos_cuidadores` table. All the data in the column will be lost.
  - Added the required column `usuario_id` to the `documentos_cuidadores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `documentos_cuidadores` DROP FOREIGN KEY `documentos_cuidadores_ibfk_1`;

-- DropIndex
DROP INDEX `cuidador_id` ON `documentos_cuidadores`;

-- AlterTable
ALTER TABLE `documentos_cuidadores` DROP COLUMN `cuidador_id`,
    ADD COLUMN `usuario_id` VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE `_aiven_keep_alive` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `last_ping` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `usuario_id_idx` ON `documentos_cuidadores`(`usuario_id`);

-- AddForeignKey
ALTER TABLE `documentos_cuidadores` ADD CONSTRAINT `documentos_prestadores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
