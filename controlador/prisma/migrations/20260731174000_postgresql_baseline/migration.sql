-- CreateEnum
CREATE TYPE "agenda_recorrente_dia_semana" AS ENUM ('domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado');

-- CreateEnum
CREATE TYPE "relatorios_tipo" AS ENUM ('financeiro', 'usuarios', 'avaliacoes', 'servicos');

-- CreateEnum
CREATE TYPE "avaliacoes_tipo_prestador" AS ENUM ('cuidador', 'enfermeiro', 'acompanhante');

-- CreateEnum
CREATE TYPE "avaliacoes_tipo_autor" AS ENUM ('cliente', 'prestador');

-- CreateEnum
CREATE TYPE "avaliacoes_tipo_avaliacao" AS ENUM ('cliente_para_prestador', 'prestador_para_cliente');

-- CreateEnum
CREATE TYPE "contratacoes_cancelado_por" AS ENUM ('cliente', 'prestador', 'admin');

-- CreateEnum
CREATE TYPE "denuncias_status" AS ENUM ('pendente', 'resolvido');

-- CreateEnum
CREATE TYPE "logs_acao_acao" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "pagamentos_status" AS ENUM ('pendente', 'pago', 'falhou');

-- CreateEnum
CREATE TYPE "agenda_status" AS ENUM ('disponivel', 'ocupado', 'indisponivel');

-- CreateEnum
CREATE TYPE "servicos_tipo_cobranca" AS ENUM ('hora', 'dia');

-- CreateEnum
CREATE TYPE "cartoes_tipo" AS ENUM ('credito', 'debito');

-- CreateEnum
CREATE TYPE "usuarios_tipo" AS ENUM ('cliente', 'cuidador', 'enfermeiro', 'acompanhante', 'admin');

-- CreateEnum
CREATE TYPE "usuarios_status_cadastro" AS ENUM ('ativo', 'pendente_pagamento', 'aguardando_confirmacao_pagamento', 'inadimplente', 'bloqueado', 'cancelado');

-- CreateEnum
CREATE TYPE "assinaturas_status" AS ENUM ('pendente', 'aguardando_confirmacao', 'ativa', 'atrasada', 'bloqueada', 'cancelada', 'falhou', 'expirada');

-- CreateEnum
CREATE TYPE "dados_bancarios_tipo_conta" AS ENUM ('corrente', 'poupanca', 'salario', 'investimento');

-- CreateEnum
CREATE TYPE "usuarios_sexo" AS ENUM ('masculino', 'feminino', 'outro');

-- CreateEnum
CREATE TYPE "agenda_tipo_prestador" AS ENUM ('cuidador', 'enfermeiro', 'acompanhante');

-- CreateEnum
CREATE TYPE "servicos_tipo_prestador" AS ENUM ('cuidador', 'enfermeiro', 'acompanhante');

-- CreateEnum
CREATE TYPE "contratacoes_tipo_prestador" AS ENUM ('cuidador', 'enfermeiro', 'acompanhante');

-- CreateEnum
CREATE TYPE "contratacoes_status" AS ENUM ('pendente', 'confirmado', 'concluido', 'paga', 'cancelado', 'nao_realizado', 'manual');

-- CreateTable
CREATE TABLE "admins" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "cargo" VARCHAR(100) DEFAULT 'Administrador do sistema',
    "permissao_total" BOOLEAN DEFAULT true,
    "criado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "agenda" (
    "id" SERIAL NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "tipo_prestador" "agenda_tipo_prestador" NOT NULL,
    "data" DATE NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fim" TIME(0) NOT NULL,
    "observacoes" TEXT,
    "servico_realizado" BOOLEAN DEFAULT false,
    "status" "agenda_status" DEFAULT 'disponivel',

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_recorrente" (
    "id" SERIAL NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "dia_semana" "agenda_recorrente_dia_semana",
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fim" TIME(0) NOT NULL,
    "ativo" BOOLEAN DEFAULT true,

    CONSTRAINT "agenda_recorrente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
    "id" SERIAL NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "plano_id" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "data_fim" TIMESTAMP(0),
    "status" "assinaturas_status" NOT NULL DEFAULT 'pendente',
    "gateway" VARCHAR(30) NOT NULL DEFAULT 'asaas',
    "gateway_customer_id" VARCHAR(120),
    "gateway_subscription_id" VARCHAR(120),
    "gateway_payment_id" VARCHAR(120),
    "gateway_status" VARCHAR(60),
    "data_ultimo_pagamento" TIMESTAMP(0),
    "data_proximo_vencimento" TIMESTAMP(0),
    "periodo_tolerancia_ate" TIMESTAMP(0),
    "confirmacao_expira_em" TIMESTAMP(0),
    "cancelada_em" TIMESTAMP(0),
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" SERIAL NOT NULL,
    "contratacao_id" INTEGER NOT NULL,
    "cliente_id" VARCHAR(20) NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "autor_id" VARCHAR(20) NOT NULL,
    "avaliado_id" VARCHAR(20) NOT NULL,
    "tipo_autor" "avaliacoes_tipo_autor" NOT NULL,
    "tipo_avaliacao" "avaliacoes_tipo_avaliacao" NOT NULL,
    "tipo_prestador" "avaliacoes_tipo_prestador" NOT NULL,
    "nota" INTEGER,
    "comentario" TEXT,
    "data_avaliacao" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratacoes" (
    "id" SERIAL NOT NULL,
    "cliente_id" VARCHAR(20) NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "tipo_prestador" "contratacoes_tipo_prestador" NOT NULL,
    "data" DATE NOT NULL,
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fim" TIME(0) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "status" "contratacoes_status" DEFAULT 'pendente',
    "observacoes" TEXT,
    "cancelado_por" "contratacoes_cancelado_por",
    "motivo_cancelamento" TEXT,
    "cancelado_em" TIMESTAMP(0),
    "cancelamento_tardio" BOOLEAN NOT NULL DEFAULT false,
    "nao_realizado_motivo" VARCHAR(80),
    "nao_realizado_em" TIMESTAMP(0),

    CONSTRAINT "contratacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuidador_especialidade" (
    "id" SERIAL NOT NULL,
    "cuidador_id" VARCHAR(20) NOT NULL,
    "especialidade_id" INTEGER NOT NULL,

    CONSTRAINT "cuidador_especialidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuidadores" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "especialidades" TEXT,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),
    "documento_profissional" VARCHAR(50),
    "conta_bancaria" VARCHAR(50),

    CONSTRAINT "cuidadores_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "denuncias" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "denuncias_status" DEFAULT 'pendente',

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_cuidadores" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "url_arquivo" VARCHAR(255) NOT NULL,

    CONSTRAINT "documentos_cuidadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enfermeiros" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "coren" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "especialidade" VARCHAR(100),
    "especialidades" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),

    CONSTRAINT "enfermeiros_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "acompanhantes" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "especialidades" TEXT,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),

    CONSTRAINT "acompanhantes_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2),
    "vencimento" DATE,
    "pago" BOOLEAN DEFAULT false,
    "data_pagamento" TIMESTAMP(0),

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acao" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20),
    "tabela_afetada" VARCHAR(100),
    "acao" "logs_acao_acao",
    "data" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acesso" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "data_hora" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(45),

    CONSTRAINT "logs_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pagamento" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "metodos_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" SERIAL NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "metodo_pagamento_id" INTEGER NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "pagamentos_status" DEFAULT 'pendente',
    "data_pagamento" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "beneficios" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_assinatura" (
    "id" SERIAL NOT NULL,
    "assinatura_id" INTEGER,
    "prestador_id" VARCHAR(20),
    "plano_id" INTEGER,
    "tipo" VARCHAR(80) NOT NULL,
    "origem" VARCHAR(40) NOT NULL DEFAULT 'sistema',
    "gateway" VARCHAR(30),
    "gateway_event_id" VARCHAR(191),
    "gateway_payment_id" VARCHAR(120),
    "gateway_subscription_id" VARCHAR(120),
    "status_anterior" VARCHAR(40),
    "status_novo" VARCHAR(40),
    "valor" DECIMAL(10,2),
    "payload_hash" VARCHAR(64),
    "payload_resumo" JSONB,
    "processado_em" TIMESTAMP(0),
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asaas_webhook_logs" (
    "id" SERIAL NOT NULL,
    "event_id" VARCHAR(191),
    "event" VARCHAR(80) NOT NULL,
    "status_processamento" VARCHAR(30) NOT NULL DEFAULT 'recebido',
    "motivo" VARCHAR(255),
    "payment_id" VARCHAR(120),
    "subscription_id" VARCHAR(120),
    "customer_id" VARCHAR(120),
    "prestador_id" VARCHAR(20),
    "assinatura_id" INTEGER,
    "assinatura_status_antes" VARCHAR(40),
    "assinatura_status_depois" VARCHAR(40),
    "valor" DECIMAL(10,2),
    "pago_em" TIMESTAMP(0),
    "payload" JSONB NOT NULL,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "asaas_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recuperacao_senhas" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiracao" TIMESTAMP(0) NOT NULL,
    "usado" BOOLEAN DEFAULT false,
    "criado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recuperacao_senhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" SERIAL NOT NULL,
    "admin_id" VARCHAR(20) NOT NULL,
    "tipo" "relatorios_tipo" NOT NULL,
    "periodo_inicio" DATE,
    "periodo_fim" DATE,
    "gerado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" SERIAL NOT NULL,
    "prestador_id" VARCHAR(20) NOT NULL,
    "tipo_prestador" "servicos_tipo_prestador" NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "tipo_cobranca" "servicos_tipo_cobranca" NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "telefone" VARCHAR(20),
    "cpf" VARCHAR(14) NOT NULL,
    "sexo" "usuarios_sexo" DEFAULT 'outro',
    "data_nascimento" DATE,
    "cep" VARCHAR(10) NOT NULL,
    "endereco" VARCHAR(255),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "estado" VARCHAR(50),
    "pais" VARCHAR(50) DEFAULT 'Brasil',
    "url_foto_perfil" VARCHAR(255),
    "tipo" "usuarios_tipo" NOT NULL,
    "status_cadastro" "usuarios_status_cadastro" NOT NULL DEFAULT 'ativo',
    "email_confirmado" BOOLEAN NOT NULL DEFAULT false,
    "termos_aceitos_em" TIMESTAMP(0),
    "termos_versao" VARCHAR(30),
    "privacidade_aceita_em" TIMESTAMP(0),
    "privacidade_versao" VARCHAR(30),
    "cookies_aceitos_em" TIMESTAMP(0),
    "cookies_versao" VARCHAR(30),
    "criado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "nome_titular" VARCHAR(100),
    "numero_mascarado" VARCHAR(20),
    "validade_mes" INTEGER,
    "validade_ano" INTEGER,
    "bandeira" VARCHAR(50),
    "tipo" "cartoes_tipo" NOT NULL DEFAULT 'credito',
    "token_gateway" VARCHAR(255),
    "ativo" BOOLEAN DEFAULT true,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_bancarios" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "banco" VARCHAR(100) NOT NULL,
    "agencia" VARCHAR(20) NOT NULL,
    "conta" VARCHAR(30) NOT NULL,
    "tipo_conta" "dados_bancarios_tipo_conta" DEFAULT 'corrente',
    "nome_titular" VARCHAR(100) NOT NULL,
    "cpf_titular" VARCHAR(14) NOT NULL,
    "criado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dados_bancarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "localizacoes" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),

    CONSTRAINT "localizacoes_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "_aiven_keep_alive" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "last_ping" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_aiven_keep_alive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmacoes_email" (
    "id" SERIAL NOT NULL,
    "usuario_id" VARCHAR(20) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expiracao" TIMESTAMP(0) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmacoes_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agenda_prestador_id_idx" ON "agenda"("prestador_id");

-- CreateIndex
CREATE INDEX "agenda_recorrente_prestador_id_idx" ON "agenda_recorrente"("prestador_id");

-- CreateIndex
CREATE INDEX "assinaturas_prestador_id_idx" ON "assinaturas"("prestador_id");

-- CreateIndex
CREATE INDEX "assinaturas_prestador_status_idx" ON "assinaturas"("prestador_id", "status");

-- CreateIndex
CREATE INDEX "plano_id" ON "assinaturas"("plano_id");

-- CreateIndex
CREATE INDEX "avaliacoes_contratacao_id_idx" ON "avaliacoes"("contratacao_id");

-- CreateIndex
CREATE INDEX "avaliacoes_cliente_id_idx" ON "avaliacoes"("cliente_id");

-- CreateIndex
CREATE INDEX "avaliacoes_prestador_id_idx" ON "avaliacoes"("prestador_id");

-- CreateIndex
CREATE INDEX "avaliacoes_autor_id_idx" ON "avaliacoes"("autor_id");

-- CreateIndex
CREATE INDEX "avaliacoes_avaliado_id_idx" ON "avaliacoes"("avaliado_id");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_contratacao_autor_unique" ON "avaliacoes"("contratacao_id", "autor_id");

-- CreateIndex
CREATE INDEX "contratacoes_cliente_id_idx" ON "contratacoes"("cliente_id");

-- CreateIndex
CREATE INDEX "contratacoes_prestador_id_idx" ON "contratacoes"("prestador_id");

-- CreateIndex
CREATE INDEX "cuidador_id" ON "cuidador_especialidade"("cuidador_id");

-- CreateIndex
CREATE INDEX "especialidade_id" ON "cuidador_especialidade"("especialidade_id");

-- CreateIndex
CREATE INDEX "denuncias_usuario_id_idx" ON "denuncias"("usuario_id");

-- CreateIndex
CREATE INDEX "usuario_id_idx" ON "documentos_cuidadores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "coren" ON "enfermeiros"("coren");

-- CreateIndex
CREATE INDEX "faturas_usuario_id_idx" ON "faturas"("usuario_id");

-- CreateIndex
CREATE INDEX "logs_acao_usuario_id_idx" ON "logs_acao"("usuario_id");

-- CreateIndex
CREATE INDEX "logs_acesso_usuario_id_idx" ON "logs_acesso"("usuario_id");

-- CreateIndex
CREATE INDEX "metodo_pagamento_id" ON "pagamentos"("metodo_pagamento_id");

-- CreateIndex
CREATE INDEX "servico_id" ON "pagamentos"("servico_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_assinatura_gateway_event_id_key" ON "eventos_assinatura"("gateway_event_id");

-- CreateIndex
CREATE INDEX "eventos_assinatura_assinatura_id_idx" ON "eventos_assinatura"("assinatura_id");

-- CreateIndex
CREATE INDEX "eventos_assinatura_prestador_id_idx" ON "eventos_assinatura"("prestador_id");

-- CreateIndex
CREATE INDEX "eventos_assinatura_tipo_idx" ON "eventos_assinatura"("tipo");

-- CreateIndex
CREATE INDEX "eventos_assinatura_gateway_subscription_id_idx" ON "eventos_assinatura"("gateway_subscription_id");

-- CreateIndex
CREATE INDEX "eventos_assinatura_payload_hash_idx" ON "eventos_assinatura"("payload_hash");

-- CreateIndex
CREATE UNIQUE INDEX "asaas_webhook_logs_event_id_key" ON "asaas_webhook_logs"("event_id");

-- CreateIndex
CREATE INDEX "asaas_webhook_logs_event_idx" ON "asaas_webhook_logs"("event");

-- CreateIndex
CREATE INDEX "asaas_webhook_logs_status_idx" ON "asaas_webhook_logs"("status_processamento");

-- CreateIndex
CREATE INDEX "asaas_webhook_logs_prestador_idx" ON "asaas_webhook_logs"("prestador_id");

-- CreateIndex
CREATE INDEX "asaas_webhook_logs_subscription_idx" ON "asaas_webhook_logs"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "recuperacao_senhas_token_key" ON "recuperacao_senhas"("token");

-- CreateIndex
CREATE INDEX "recuperacao_senhas_usuario_id_idx" ON "recuperacao_senhas"("usuario_id");

-- CreateIndex
CREATE INDEX "admin_id" ON "relatorios"("admin_id");

-- CreateIndex
CREATE INDEX "servicos_prestador_id_idx" ON "servicos"("prestador_id");

-- CreateIndex
CREATE UNIQUE INDEX "email" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cpf" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "cartoes_usuario_id_idx" ON "cartoes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "confirmacoes_email_token_key" ON "confirmacoes_email"("token");

-- CreateIndex
CREATE INDEX "confirmacoes_email_usuario_id_idx" ON "confirmacoes_email"("usuario_id");

-- CreateIndex
CREATE INDEX "confirmacoes_email_token_idx" ON "confirmacoes_email"("token");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_ibfk_1" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda_recorrente" ADD CONSTRAINT "agenda_recorrente_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_ibfk_2" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_contratacao_id_fkey" FOREIGN KEY ("contratacao_id") REFERENCES "contratacoes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_ibfk_1" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_ibfk_2" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliado_id_fkey" FOREIGN KEY ("avaliado_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_ibfk_1" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_ibfk_2" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuidador_especialidade" ADD CONSTRAINT "cuidador_especialidade_ibfk_1" FOREIGN KEY ("cuidador_id") REFERENCES "cuidadores"("usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuidador_especialidade" ADD CONSTRAINT "cuidador_especialidade_ibfk_2" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuidadores" ADD CONSTRAINT "cuidadores_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documentos_cuidadores" ADD CONSTRAINT "documentos_prestadores_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enfermeiros" ADD CONSTRAINT "enfermeiros_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "acompanhantes" ADD CONSTRAINT "acompanhantes_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_acao" ADD CONSTRAINT "logs_acao_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_acesso" ADD CONSTRAINT "logs_acesso_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_ibfk_1" FOREIGN KEY ("servico_id") REFERENCES "contratacoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_ibfk_2" FOREIGN KEY ("metodo_pagamento_id") REFERENCES "metodos_pagamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventos_assinatura" ADD CONSTRAINT "eventos_assinatura_assinatura_id_fkey" FOREIGN KEY ("assinatura_id") REFERENCES "assinaturas"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventos_assinatura" ADD CONSTRAINT "eventos_assinatura_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recuperacao_senhas" ADD CONSTRAINT "recuperacao_senhas_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_ibfk_1" FOREIGN KEY ("admin_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_ibfk_1" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dados_bancarios" ADD CONSTRAINT "dados_bancarios_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "localizacoes" ADD CONSTRAINT "fk_localizacoes_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmacoes_email" ADD CONSTRAINT "confirmacoes_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

