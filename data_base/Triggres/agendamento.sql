DELIMITER $$

CREATE TRIGGER criar_agendamento_apos_contratacao
AFTER INSERT ON contratacoes
FOR EACH ROW
BEGIN
  INSERT INTO agenda (
    prestador_id,
    tipo_prestador,
    data,
    hora_inicio,
    hora_fim,
    status
  ) VALUES (
    NEW.prestador_id,
    NEW.tipo_prestador,
    NEW.data,
    NEW.hora_inicio,
    NEW.hora_fim,
    'ocupado'
  );
END $$

DELIMITER ;
