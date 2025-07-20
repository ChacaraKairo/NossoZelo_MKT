CREATE TABLE IF NOT EXISTS especialidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);
CREATE TABLE IF NOT EXISTS cuidador_especialidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    especialidade_id INT NOT NULL,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id),
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
);