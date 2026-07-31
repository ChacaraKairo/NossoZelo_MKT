ALTER TABLE documentos_campos_extraidos
  ADD COLUMN IF NOT EXISTS valor_mascarado TEXT;

CREATE TABLE IF NOT EXISTS documentos_analises (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL,
  usuario_id VARCHAR(20) NOT NULL,
  tipo_detectado VARCHAR(80),
  sinal VARCHAR(20) NOT NULL,
  score DECIMAL(5, 2),
  status VARCHAR(40) NOT NULL,
  arquivo_legivel BOOLEAN NOT NULL DEFAULT false,
  tipo_confere BOOLEAN NOT NULL DEFAULT false,
  nome_confere BOOLEAN NOT NULL DEFAULT false,
  cpf_confere BOOLEAN NOT NULL DEFAULT false,
  validade_confere BOOLEAN,
  precisa_revisao BOOLEAN NOT NULL DEFAULT true,
  dados_extraidos JSONB,
  validacoes JSONB,
  pendencias JSONB,
  motivo TEXT,
  provider VARCHAR(80),
  provider_request_id VARCHAR(120),
  criado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT documentos_analises_documento_id_fkey
    FOREIGN KEY (documento_id) REFERENCES documentos_verificacao(id)
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT documentos_analises_usuario_id_fkey
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS documentos_analises_documento_id_idx
  ON documentos_analises(documento_id);
CREATE INDEX IF NOT EXISTS documentos_analises_usuario_id_idx
  ON documentos_analises(usuario_id);
CREATE INDEX IF NOT EXISTS documentos_analises_sinal_idx
  ON documentos_analises(sinal);
CREATE INDEX IF NOT EXISTS documentos_analises_status_idx
  ON documentos_analises(status);
