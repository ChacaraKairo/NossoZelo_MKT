/*
  Warnings:

  - A unique constraint covering the columns `[contratacao_id]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contratacao_id` to the `avaliacoes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `avaliacoes` ADD COLUMN `contratacao_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `contratacoes` MODIFY `status` ENUM('pendente', 'confirmado', 'concluido', 'paga', 'cancelado', 'manual') NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `avaliacao_media` DECIMAL(3, 2) NULL DEFAULT 0.00;

-- CreateIndex
CREATE UNIQUE INDEX `avaliacoes_contratacao_id_key` ON `avaliacoes`(`contratacao_id`);
