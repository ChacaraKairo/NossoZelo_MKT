SET @index_exists = (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'assinaturas'
    AND INDEX_NAME = 'assinaturas_prestador_status_idx'
);

SET @statement = IF(
  @index_exists = 0,
  'CREATE INDEX `assinaturas_prestador_status_idx` ON `assinaturas`(`prestador_id`, `status`)',
  'SELECT 1'
);

PREPARE stmt FROM @statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE `usuarios` u
SET u.`status_cadastro` = 'pendente_pagamento'
WHERE u.`tipo` IN ('cuidador', 'enfermeiro', 'acompanhante')
  AND u.`status_cadastro` = 'ativo'
  AND NOT EXISTS (
    SELECT 1
    FROM `assinaturas` a
    WHERE a.`prestador_id` = u.`id`
      AND a.`status` = 'ativa'
  );
