CREATE TABLE IF NOT EXISTS documentos_cuidadores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    url_arquivo VARCHAR(255) NOT NULL,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id)
);
