CREATE TABLE IF NOT EXISTS contratacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id VARCHAR(20) NOT NULL,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'confirmado', 'concluido', 'cancelado') DEFAULT 'pendente',
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);