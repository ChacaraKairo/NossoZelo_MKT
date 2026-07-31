CREATE TABLE IF NOT EXISTS agenda_recorrente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    dia_semana ENUM('domingo','segunda','terça','quarta','quinta','sexta','sábado'),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id)
);