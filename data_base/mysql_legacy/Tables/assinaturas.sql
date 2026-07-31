CREATE TABLE IF NOT EXISTS planos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    beneficios TEXT
);
CREATE TABLE IF NOT EXISTS assinaturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    plano_id INT NOT NULL,
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id),
    FOREIGN KEY (plano_id) REFERENCES planos(id)
);