CREATE TABLE IF NOT EXISTS tipos_documentos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(80) NOT NULL UNIQUE,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(60) NOT NULL,
  obrigatorio_cuidador BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_enfermeiro BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_acompanhante BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_baba BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_diarista BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_motorista_assistencial BOOLEAN NOT NULL DEFAULT false,
  obrigatorio_busca BOOLEAN NOT NULL DEFAULT false,
  requer_upload BOOLEAN NOT NULL DEFAULT true,
  exige_frente BOOLEAN NOT NULL DEFAULT false,
  exige_verso BOOLEAN NOT NULL DEFAULT false,
  exige_selfie BOOLEAN NOT NULL DEFAULT false,
  exige_validade BOOLEAN NOT NULL DEFAULT false,
  exige_numero_documento BOOLEAN NOT NULL DEFAULT false,
  exige_orgao_emissor BOOLEAN NOT NULL DEFAULT false,
  exige_uf_emissor BOOLEAN NOT NULL DEFAULT false,
  exige_data_emissao BOOLEAN NOT NULL DEFAULT false,
  exige_revisao_manual BOOLEAN NOT NULL DEFAULT true,
  permite_pdf BOOLEAN NOT NULL DEFAULT true,
  permite_imagem BOOLEAN NOT NULL DEFAULT true,
  tamanho_maximo_mb INTEGER NOT NULL DEFAULT 10,
  validade_dias INTEGER,
  revalidar_apos_vencimento BOOLEAN NOT NULL DEFAULT true,
  nivel_risco VARCHAR(20) NOT NULL DEFAULT 'MEDIO',
  provider_sugerido VARCHAR(80),
  campos_esperados JSONB,
  regras_validacao JSONB,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS tipos_documentos_categoria_idx
  ON tipos_documentos(categoria);
CREATE INDEX IF NOT EXISTS tipos_documentos_ativo_idx
  ON tipos_documentos(ativo);
CREATE INDEX IF NOT EXISTS tipos_documentos_obrigatorio_busca_idx
  ON tipos_documentos(obrigatorio_busca);

CREATE TABLE IF NOT EXISTS documentos_campos_extraidos (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL,
  campo VARCHAR(80) NOT NULL,
  valor TEXT,
  confianca DECIMAL(5, 2),
  origem VARCHAR(40),
  criado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT documentos_campos_extraidos_documento_id_fkey
    FOREIGN KEY (documento_id) REFERENCES documentos_verificacao(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS documentos_campos_extraidos_documento_id_idx
  ON documentos_campos_extraidos(documento_id);
CREATE INDEX IF NOT EXISTS documentos_campos_extraidos_campo_idx
  ON documentos_campos_extraidos(campo);

CREATE TABLE IF NOT EXISTS tipos_documentos_regras (
  id SERIAL PRIMARY KEY,
  tipo_documento_id INTEGER NOT NULL,
  codigo VARCHAR(80) NOT NULL,
  descricao TEXT NOT NULL,
  severidade VARCHAR(20) NOT NULL DEFAULT 'ERRO',
  ativo BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT tipos_documentos_regras_tipo_documento_id_fkey
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documentos(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS tipos_documentos_regras_tipo_codigo_key
  ON tipos_documentos_regras(tipo_documento_id, codigo);
CREATE INDEX IF NOT EXISTS tipos_documentos_regras_tipo_documento_id_idx
  ON tipos_documentos_regras(tipo_documento_id);
CREATE INDEX IF NOT EXISTS tipos_documentos_regras_codigo_idx
  ON tipos_documentos_regras(codigo);

ALTER TABLE documentos_verificacao
  ADD COLUMN IF NOT EXISTS tipo_documento_id INTEGER;

ALTER TABLE documentos_verificacao
  ADD CONSTRAINT documentos_verificacao_tipo_documento_id_fkey
  FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documentos(id)
  ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS documentos_verificacao_tipo_documento_id_idx
  ON documentos_verificacao(tipo_documento_id);
