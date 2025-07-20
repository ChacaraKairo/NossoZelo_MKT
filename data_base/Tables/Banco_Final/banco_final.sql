-- Nível 1: Entidades Base (Independentes)
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

-- Tabela de Especialidades
CREATE TABLE IF NOT EXISTS especialidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    beneficios TEXT
);

-- Tabela de Métodos de Pagamento
CREATE TABLE IF NOT EXISTS metodos_pagamento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL
);

-- Nível 2: Perfis de Usuário e Configurações Iniciais
-- Tabela de Cuidadores
CREATE TABLE IF NOT EXISTS cuidadores (
    usuario_id VARCHAR(20) PRIMARY KEY,
    bio TEXT,
    experiencia TEXT,
    avaliacao_media DECIMAL(3,2) DEFAULT 0.0,
    documento_profissional VARCHAR(50),
    conta_bancaria VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de Enfermeiros
CREATE TABLE IF NOT EXISTS enfermeiros (
    usuario_id VARCHAR(20) PRIMARY KEY,
    coren VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(100),
    experiencia TEXT,
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

-- Tabela de Cartões
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

-- Tabela de Recuperação de Senhas
CREATE TABLE IF NOT EXISTS recuperacao_senhas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Serviços (oferecidos por prestadores)
CREATE TABLE IF NOT EXISTS servicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    tipo_cobranca ENUM('hora', 'dia') NOT NULL,
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);

-- Tabela de Agenda (disponibilidade pontual do prestador)
CREATE TABLE IF NOT EXISTS agenda (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status ENUM('disponivel', 'ocupado', 'indisponivel') DEFAULT 'disponivel',
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);

-- Tabela de Relacionamento Cuidador-Especialidade
CREATE TABLE IF NOT EXISTS cuidador_especialidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    especialidade_id INT NOT NULL,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id),
    FOREIGN KEY (especialidade_id) REFERENCES especialidades(id)
);

-- Nível 3: Transações e Documentos
-- Tabela de Documentos de Cuidadores
CREATE TABLE IF NOT EXISTS documentos_cuidadores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    url_arquivo VARCHAR(255) NOT NULL,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id)
);

-- Tabela de Agenda Recorrente (disponibilidade semanal)
CREATE TABLE IF NOT EXISTS agenda_recorrente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    dia_semana ENUM('domingo','segunda','terça','quarta','quinta','sexta','sábado'),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id)
);

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cuidador_id VARCHAR(20) NOT NULL,
    plano_id INT NOT NULL,
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    FOREIGN KEY (cuidador_id) REFERENCES cuidadores(usuario_id),
    FOREIGN KEY (plano_id) REFERENCES planos(id)
);

-- Tabela de Contratações (agendamentos de serviços)
CREATE TABLE IF NOT EXISTS contratacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id VARCHAR(20) NOT NULL,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'confirmado', 'concluido', 'cancelado') DEFAULT 'pendente',
    observacoes TEXT,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id VARCHAR(20) NOT NULL,
    prestador_id VARCHAR(20) NOT NULL,
    tipo_prestador ENUM('cuidador', 'enfermeiro') NOT NULL,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (prestador_id) REFERENCES usuarios(id)
);

-- Tabela de Denúncias
CREATE TABLE IF NOT EXISTS denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('pendente', 'resolvido') DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Faturas
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

-- Logs de Ações (Auditoria)
CREATE TABLE IF NOT EXISTS logs_acao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20),
    tabela_afetada VARCHAR(100),
    acao ENUM('INSERT', 'UPDATE', 'DELETE'),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Logs de Acesso
CREATE TABLE IF NOT EXISTS logs_acesso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(20) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id VARCHAR(20) NOT NULL,
    tipo ENUM('financeiro', 'usuarios', 'avaliacoes', 'servicos') NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    gerado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id)
);

-- Nível 4: Registros Financeiros Detalhados
-- Tabela de Pagamentos
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
