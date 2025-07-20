CREATE TABLE IF NOT EXISTS dados_bancarios (
    usuario_id VARCHAR(20) PRIMARY KEY,
    banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(20) NOT NULL,
    conta VARCHAR(30) NOT NULL,
    tipo_conta ENUM('corrente', 'poupanca', 'salario', 'investimento') DEFAULT 'corrente',
    nome_titular VARCHAR(100) NOT NULL,
    cpf_titular VARCHAR(14) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
