CREATE TABLE IF NOT EXISTS agenda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro', 'acompanhante') NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('disponivel', 'ocupado', 'indisponivel') DEFAULT 'disponivel',
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);