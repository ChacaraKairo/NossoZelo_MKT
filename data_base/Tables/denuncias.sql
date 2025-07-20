CREATE TABLE IF NOT EXISTS denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('pendente', 'resolvido') DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);