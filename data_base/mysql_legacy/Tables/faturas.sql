CREATE TABLE IF NOT EXISTS faturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10,2),
    vencimento DATE,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);