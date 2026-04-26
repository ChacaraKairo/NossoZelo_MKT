ALTER TABLE usuarios
  ADD COLUMN bairro VARCHAR(100) NULL AFTER endereco;

ALTER TABLE cuidadores
  ADD COLUMN valor_hora DECIMAL(10, 2) NULL AFTER anos_experiencia,
  ADD COLUMN valor_diaria DECIMAL(10, 2) NULL AFTER valor_hora,
  ADD COLUMN disponibilidade VARCHAR(255) NULL AFTER valor_diaria,
  ADD COLUMN especialidades TEXT NULL AFTER disponibilidade;

ALTER TABLE enfermeiros
  ADD COLUMN especialidades TEXT NULL AFTER especialidade,
  ADD COLUMN valor_hora DECIMAL(10, 2) NULL AFTER anos_experiencia,
  ADD COLUMN valor_diaria DECIMAL(10, 2) NULL AFTER valor_hora,
  ADD COLUMN disponibilidade VARCHAR(255) NULL AFTER valor_diaria;

ALTER TABLE acompanhantes
  ADD COLUMN valor_hora DECIMAL(10, 2) NULL AFTER anos_experiencia,
  ADD COLUMN valor_diaria DECIMAL(10, 2) NULL AFTER valor_hora,
  ADD COLUMN disponibilidade VARCHAR(255) NULL AFTER valor_diaria,
  ADD COLUMN especialidades TEXT NULL AFTER disponibilidade;
