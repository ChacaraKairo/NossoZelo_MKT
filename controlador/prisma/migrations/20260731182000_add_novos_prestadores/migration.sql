-- Add new provider categories to existing PostgreSQL enums.
ALTER TYPE "avaliacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'baba';
ALTER TYPE "avaliacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'diarista';
ALTER TYPE "avaliacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'motorista_assistencial';

ALTER TYPE "usuarios_tipo" ADD VALUE IF NOT EXISTS 'baba';
ALTER TYPE "usuarios_tipo" ADD VALUE IF NOT EXISTS 'diarista';
ALTER TYPE "usuarios_tipo" ADD VALUE IF NOT EXISTS 'motorista_assistencial';

ALTER TYPE "agenda_tipo_prestador" ADD VALUE IF NOT EXISTS 'baba';
ALTER TYPE "agenda_tipo_prestador" ADD VALUE IF NOT EXISTS 'diarista';
ALTER TYPE "agenda_tipo_prestador" ADD VALUE IF NOT EXISTS 'motorista_assistencial';

ALTER TYPE "servicos_tipo_prestador" ADD VALUE IF NOT EXISTS 'baba';
ALTER TYPE "servicos_tipo_prestador" ADD VALUE IF NOT EXISTS 'diarista';
ALTER TYPE "servicos_tipo_prestador" ADD VALUE IF NOT EXISTS 'motorista_assistencial';

ALTER TYPE "contratacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'baba';
ALTER TYPE "contratacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'diarista';
ALTER TYPE "contratacoes_tipo_prestador" ADD VALUE IF NOT EXISTS 'motorista_assistencial';

CREATE TABLE "babas" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "especialidades" TEXT,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),

    CONSTRAINT "babas_pkey" PRIMARY KEY ("usuario_id")
);

CREATE TABLE "diaristas" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "especialidades" TEXT,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),

    CONSTRAINT "diaristas_pkey" PRIMARY KEY ("usuario_id")
);

CREATE TABLE "motoristas_assistenciais" (
    "usuario_id" VARCHAR(20) NOT NULL,
    "bio" TEXT,
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(10,2),
    "valor_diaria" DECIMAL(10,2),
    "disponibilidade" VARCHAR(255),
    "especialidades" TEXT,
    "avaliacao_media" DECIMAL(3,2) DEFAULT 0.00,
    "documentos" VARCHAR(255),
    "placa" VARCHAR(10) NOT NULL,

    CONSTRAINT "motoristas_assistenciais_pkey" PRIMARY KEY ("usuario_id")
);

ALTER TABLE "babas" ADD CONSTRAINT "babas_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "diaristas" ADD CONSTRAINT "diaristas_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "motoristas_assistenciais" ADD CONSTRAINT "motoristas_assistenciais_ibfk_1" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
