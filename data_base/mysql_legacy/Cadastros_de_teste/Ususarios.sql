/*Cadastro de Ususarios de todos os tipos */

-- Inserindo usuários a partir do arquivo usuarios.jsonl

-- Usuário 1: Ana Silva (cliente)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('C-iFE5PBjC8WhJ5sEb9t', 'Ana Silva', 'ana.silva@email.com', 'senha123hash', '(11) 91234-5678', '123.456.789-00', 'feminino', '1985-03-21', '01001-000', 'Rua das Flores, 123', 'São Paulo', 'SP', 'Brasil', 'https://exemplo.com/fotos/ana.jpg', 'cliente');

-- Usuário 2: Bruno Costa (cuidador)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('26KZl9Byh3EjetvaMt6R', 'Bruno Costa', 'bruno.costa@email.com', 'senha123hash', '(21) 99876-5432', '234.567.890-11', 'masculino', '1979-07-15', '20040-004', 'Av. Central, 456', 'Rio de Janeiro', 'RJ', 'Brasil', 'https://exemplo.com/fotos/bruno.jpg', 'cuidador');

-- Usuário 3: Carla Souza (enfermeiro)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('3', 'Carla Souza', 'carla.souza@email.com', 'senha123hash', '(31) 98765-4321', '345.678.901-22', 'feminino', '1990-01-10', '30112-010', 'Rua Verde, 789', 'Belo Horizonte', 'MG', 'Brasil', 'https://exemplo.com/fotos/carla.jpg', 'enfermeiro');

-- Usuário 4: Daniel Alves (acompanhante)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('4', 'Daniel Alves', 'daniel.alves@email.com', 'senha123hash', '(41) 91234-5678', '456.789.012-33', 'masculino', '1988-11-05', '80010-010', 'Rua Azul, 101', 'Curitiba', 'PR', 'Brasil', 'https://exemplo.com/fotos/daniel.jpg', 'acompanhante');

-- Usuário 5: Elisa Fernandes (cliente)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('5', 'Elisa Fernandes', 'elisa.fernandes@email.com', 'senha123hash', '(51) 98765-1234', '567.890.123-44', 'feminino', '1992-06-18', '90010-150', 'Av. das Palmeiras, 202', 'Porto Alegre', 'RS', 'Brasil', 'https://exemplo.com/fotos/elisa.jpg', 'cliente');

-- Usuário 6: Fábio Lima (cuidador)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('6', 'Fábio Lima', 'fabio.lima@email.com', 'senha123hash', '(61) 91234-5678', '678.901.234-55', 'masculino', '1975-12-25', '70070-000', 'Rua Amarela, 303', 'Brasília', 'DF', 'Brasil', 'https://exemplo.com/fotos/fabio.jpg', 'cuidador');

-- Usuário 7: Gabriela Melo (enfermeiro)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('7', 'Gabriela Melo', 'gabriela.melo@email.com', 'senha123hash', '(71) 98765-9876', '789.012.345-66', 'feminino', '1983-09-09', '40020-000', 'Rua das Acácias, 404', 'Salvador', 'BA', 'Brasil', 'https://exemplo.com/fotos/gabriela.jpg', 'enfermeiro');

-- Usuário 8: Henrique Martins (acompanhante)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('8', 'Henrique Martins', 'henrique.martins@email.com', 'senha123hash', '(81) 91234-1111', '890.123.456-77', 'masculino', '1995-04-02', '50030-000', 'Av. dos Lírios, 505', 'Recife', 'PE', 'Brasil', 'https://exemplo.com/fotos/henrique.jpg', 'acompanhante');

-- Usuário 9: Isabela Nunes (cliente)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('9', 'Isabela Nunes', 'isabela.nunes@email.com', 'senha123hash', '(91) 98765-2222', '901.234.567-88', 'feminino', '1987-08-30', '66015-000', 'Rua das Orquídeas, 606', 'Belém', 'PA', 'Brasil', 'https://exemplo.com/fotos/isabela.jpg', 'cliente');

-- Usuário 10: João Pedro (admin)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('10', 'João Pedro', 'joao.pedro@email.com', 'senha123hash', '(11) 91234-3333', '012.345.678-99', 'masculino', '1993-05-14', '01001-000', 'Av. dos Jasmins, 707', 'São Paulo', 'SP', 'Brasil', 'https://exemplo.com/fotos/joao.jpg', 'admin');

-- Usuário 11: Kátia Rocha (cuidador)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('11', 'Kátia Rocha', 'katia.rocha@email.com', 'senha123hash', '(21) 98765-4444', '123.456.789-10', 'feminino', '1980-02-27', '20040-004', 'Rua das Camélias, 808', 'Rio de Janeiro', 'RJ', 'Brasil', 'https://exemplo.com/fotos/katia.jpg', 'cuidador');

-- Usuário 12: Lucas Oliveira (enfermeiro)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('12', 'Lucas Oliveira', 'lucas.oliveira@email.com', 'senha123hash', '(31) 91234-5555', '234.567.890-21', 'masculino', '1991-07-19', '30112-010', 'Av. dos Girassóis, 909', 'Belo Horizonte', 'MG', 'Brasil', 'https://exemplo.com/fotos/lucas.jpg', 'enfermeiro');

-- Usuário 13: Mariana Dias (acompanhante)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('13', 'Mariana Dias', 'mariana.dias@email.com', 'senha123hash', '(41) 98765-6666', '345.678.901-32', 'feminino', '1984-10-03', '80010-010', 'Rua das Violetas, 1010', 'Curitiba', 'PR', 'Brasil', 'https://exemplo.com/fotos/mariana.jpg', 'acompanhante');

-- Usuário 14: Nicolas Costa (cliente)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('14', 'Nicolas Costa', 'nicolas.costa@email.com', 'senha123hash', '(51) 91234-7777', '456.789.012-43', 'masculino', '1996-03-22', '90010-150', 'Av. das Hortênsias, 1111', 'Porto Alegre', 'RS', 'Brasil', 'https://exemplo.com/fotos/nicolas.jpg', 'cliente');

-- Usuário 15: Olivia Santos (admin)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('15', 'Olivia Santos', 'olivia.santos@email.com', 'senha123hash', '(61) 98765-8888', '567.890.123-54', 'feminino', '1982-01-17', '70070-000', 'Rua das Margaridas, 1212', 'Brasília', 'DF', 'Brasil', 'https://exemplo.com/fotos/olivia.jpg', 'admin');

-- Usuário 16: Paulo Souza (cuidador)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('16', 'Paulo Souza', 'paulo.souza@email.com', 'senha123hash', '(71) 91234-9999', '678.901.234-65', 'masculino', '1994-11-11', '40020-000', 'Av. das Azaleias, 1313', 'Salvador', 'BA', 'Brasil', 'https://exemplo.com/fotos/paulo.jpg', 'cuidador');

-- Usuário 17: Quésia Lima (enfermeiro)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('17', 'Quésia Lima', 'quesia.lima@email.com', 'senha123hash', '(81) 98765-0000', '789.012.345-76', 'feminino', '1986-06-06', '50030-000', 'Rua dos Cravos, 1414', 'Recife', 'PE', 'Brasil', 'https://exemplo.com/fotos/quesia.jpg', 'enfermeiro');

-- Usuário 18: Rafael Gomes (acompanhante)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('18', 'Rafael Gomes', 'rafael.gomes@email.com', 'senha123hash', '(91) 91234-1212', '890.123.456-87', 'masculino', '1997-09-09', '66015-000', 'Av. das Camélias, 1515', 'Belém', 'PA', 'Brasil', 'https://exemplo.com/fotos/rafael.jpg', 'acompanhante');

-- Usuário 19: Sofia Andrade (cliente)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('19', 'Sofia Andrade', 'sofia.andrade@email.com', 'senha123hash', '(11) 98765-1313', '901.234.567-98', 'feminino', '1989-12-12', '01001-000', 'Rua das Azaleias, 1616', 'São Paulo', 'SP', 'Brasil', 'https://exemplo.com/fotos/sofia.jpg', 'cliente');

-- Usuário 20: Thiago Ribeiro (admin)
INSERT INTO usuarios (id, nome, email, senha, telefone, cpf, sexo, data_nascimento, cep, endereco, cidade, estado, pais, url_foto_perfil, tipo)
VALUES ('20', 'Thiago Ribeiro', 'thiago.ribeiro@email.com', 'senha123hash', '(21) 91234-1414', '012.345.678-09', 'masculino', '1981-04-04', '20040-004', 'Av. das Orquídeas, 1717', 'Rio de Janeiro', 'RJ', 'Brasil', 'https://exemplo.com/fotos/thiago.jpg', 'admin');