ALTER TABLE `assinaturas`
MODIFY COLUMN `gateway` VARCHAR(30) NOT NULL DEFAULT 'asaas';

UPDATE `planos`
SET `valor` = 0.01
WHERE `nome` = 'Assinatura Profissional Mensal';
