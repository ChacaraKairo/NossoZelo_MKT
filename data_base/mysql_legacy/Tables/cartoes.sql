CREATE TABLE IF NOT EXISTS cartoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    nome_titular VARCHAR(100),
    numero_mascarado VARCHAR(20) CHECK (CHAR_LENGTH(numero_mascarado) >= 4),
    validade_mes INT,
    validade_ano INT,
    bandeira VARCHAR(50),
    tipo ENUM('credito', 'debito') NOT NULL DEFAULT 'credito',
    token_gateway VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
