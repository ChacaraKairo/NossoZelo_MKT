CREATE TABLE IF NOT EXISTS metodos_pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL
);
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    servico_id INT NOT NULL,
    metodo_pagamento_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'pago', 'falhou') DEFAULT 'pendente',
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (servico_id) REFERENCES contratacoes(id),
    FOREIGN KEY (metodo_pagamento_id) REFERENCES metodos_pagamento(id)
);