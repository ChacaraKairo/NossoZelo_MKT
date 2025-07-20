-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(20) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    pais VARCHAR(50) DEFAULT 'Brasil',
    url_foto_perfil VARCHAR(255),
    tipo ENUM('cliente', 'cuidador', 'enfermeiro','acompanhante', 'admin') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cuidadores
CREATE TABLE IF NOT EXISTS cuidadores (
    usuario_id VARCHAR(20) PRIMARY KEY,
    bio TEXT,
    experiencia TEXT,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.0,
    documento_profissional VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Enfermeiros 
CREATE TABLE IF NOT EXISTS enfermeiros (
    usuario_id VARCHAR(20) PRIMARY KEY,
    coren VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100),
    experiencia TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS admins (
    usuario_id VARCHAR(20) PRIMARY KEY,
    cargo VARCHAR(100) DEFAULT 'Administrador do sistema',
    permissao_total BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);