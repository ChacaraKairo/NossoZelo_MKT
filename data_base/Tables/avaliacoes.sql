CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id VARCHAR(20) NOT NULL,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);