CREATE TABLE IF NOT EXISTS relatorios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id VARCHAR(20) NOT NULL,
    tipo ENUM('financeiro', 'usuarios', 'avaliacoes', 'servicos') NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    gerado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id)
);
alter table relatorios MODIFY COLUMN tipo ENUM('financeiro', 'usuarios', 'avaliacoes', 'servicos') NOT NULL;