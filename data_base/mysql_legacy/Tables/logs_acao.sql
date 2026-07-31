-- Logs de Ações (Auditoria)
CREATE TABLE IF NOT EXISTS logs_acao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20),
    tabela_afetada VARCHAR(100),
    acao ENUM('INSERT', 'UPDATE', 'DELETE'),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);