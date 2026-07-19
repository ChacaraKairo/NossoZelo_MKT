-- Corrige valores legados com encoding quebrado em agenda_recorrente.dia_semana.
-- A migration primeiro expande temporariamente o ENUM para aceitar valores
-- antigos e corretos, depois normaliza os dados e fecha o ENUM apenas com
-- valores UTF-8 corretos.

ALTER TABLE `agenda_recorrente`
  MODIFY `dia_semana` ENUM(
    'domingo',
    'segunda',
    'terÃ§a',
    'terÃƒÂ§a',
    'terça',
    'quarta',
    'quinta',
    'sexta',
    'sÃ¡bado',
    'sÃƒÂ¡bado',
    'sábado'
  ) NULL;

UPDATE `agenda_recorrente`
SET `dia_semana` = 'terça'
WHERE `dia_semana` IN ('terÃ§a', 'terÃƒÂ§a');

UPDATE `agenda_recorrente`
SET `dia_semana` = 'sábado'
WHERE `dia_semana` IN ('sÃ¡bado', 'sÃƒÂ¡bado');

ALTER TABLE `agenda_recorrente`
  MODIFY `dia_semana` ENUM(
    'domingo',
    'segunda',
    'terça',
    'quarta',
    'quinta',
    'sexta',
    'sábado'
  ) NULL;
