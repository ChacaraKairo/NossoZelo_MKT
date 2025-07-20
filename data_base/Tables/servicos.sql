CREATE TABLE IF NOT EXISTS servicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    tipo_cobranca ENUM('hora', 'dia') NOT NULL,
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);