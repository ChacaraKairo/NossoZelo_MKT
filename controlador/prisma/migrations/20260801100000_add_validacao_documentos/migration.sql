DO $$ BEGIN
  CREATE TYPE documentos_verificacao_status AS ENUM (
    'nao_enviado',
    'enviado',
    'em_validacao',
    'aprovado',
    'pendente_revisao',
    'recusado',
    'expirado'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE revisoes_documentos_decisao AS ENUM (
    'aprovado',
    'recusado',
    'pendente_revisao'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS documentos_status documentos_verificacao_status NOT NULL DEFAULT 'nao_enviado',
  ADD COLUMN IF NOT EXISTS identidade_status VARCHAR(40) DEFAULT 'nao_iniciada',
  ADD COLUMN IF NOT EXISTS profissional_status VARCHAR(40) DEFAULT 'nao_aplicavel',
  ADD COLUMN IF NOT EXISTS documentos_revisado_em TIMESTAMP(0);

CREATE TABLE IF NOT EXISTS documentos_verificacao (
  id SERIAL PRIMARY KEY,
  usuario_id VARCHAR(20) NOT NULL,
  tipo_documento VARCHAR(50) NOT NULL,
  arquivo_chave VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  tamanho_bytes INTEGER,
  status documentos_verificacao_status NOT NULL DEFAULT 'enviado',
  provedor VARCHAR(60),
  score DECIMAL(5, 2),
  motivo_recusa TEXT,
  dados_extraidos JSONB,
  resultado_resumo JSONB,
  criado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT documentos_verificacao_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS documentos_verificacao_usuario_id_idx
  ON documentos_verificacao(usuario_id);
CREATE INDEX IF NOT EXISTS documentos_verificacao_status_idx
  ON documentos_verificacao(status);
CREATE INDEX IF NOT EXISTS documentos_verificacao_tipo_documento_idx
  ON documentos_verificacao(tipo_documento);

CREATE TABLE IF NOT EXISTS revisoes_documentos (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL,
  usuario_id VARCHAR(20) NOT NULL,
  admin_id VARCHAR(20),
  decisao revisoes_documentos_decisao NOT NULL,
  motivo TEXT,
  criado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT revisoes_documentos_documento_id_fkey
    FOREIGN KEY (documento_id) REFERENCES documentos_verificacao(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT revisoes_documentos_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS revisoes_documentos_documento_id_idx
  ON revisoes_documentos(documento_id);
CREATE INDEX IF NOT EXISTS revisoes_documentos_usuario_id_idx
  ON revisoes_documentos(usuario_id);
CREATE INDEX IF NOT EXISTS revisoes_documentos_admin_id_idx
  ON revisoes_documentos(admin_id);
