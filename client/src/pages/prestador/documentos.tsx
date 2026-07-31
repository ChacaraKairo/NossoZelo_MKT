import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import HeaderMain from '@/components/header/HeaderMain';
import {
  DocumentoVerificacao,
  enviarDocumentoVerificacao,
  obterStatusDocumental,
  StatusDocumental,
} from '@/service/documentosService';
import styles from '@/styles/DocumentosPrestadorPage.module.css';

const OPCOES_DOCUMENTO = [
  { value: 'documento_identidade', label: 'Documento de identidade' },
  { value: 'cnh', label: 'CNH' },
  { value: 'cpf', label: 'CPF' },
  { value: 'comprovante_residencia', label: 'Comprovante de residencia' },
  { value: 'certificado_curso', label: 'Certificado de curso' },
  { value: 'coren', label: 'COREN' },
  { value: 'selfie', label: 'Selfie' },
];

function formatarData(valor?: string | null) {
  if (!valor) return 'Ainda nao revisado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Ainda nao revisado';
  return data.toLocaleString('pt-BR');
}

function DocumentoItem({ documento }: { documento: DocumentoVerificacao }) {
  return (
    <div className={styles.document}>
      <div>
        <strong>{documento.tipo_documento}</strong>
        <span className={styles.muted}>
          Enviado em {formatarData(documento.criado_em)}
          {documento.motivo_recusa ? ` · ${documento.motivo_recusa}` : ''}
        </span>
      </div>
      <span className={styles.badge}>{documento.status}</span>
    </div>
  );
}

export default function DocumentosPrestadorPage() {
  const [status, setStatus] = useState<StatusDocumental | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState(OPCOES_DOCUMENTO[0].value);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      setStatus(await obterStatusDocumental());
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar seus documentos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const documentosOrdenados = useMemo(
    () => [...(status?.documentos || [])].sort((a, b) => b.id - a.id),
    [status?.documentos],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    setEnviando(true);
    setErro(null);
    setSucesso(null);

    try {
      await enviarDocumentoVerificacao(tipoDocumento, arquivo);
      setArquivo(null);
      setSucesso('Documento enviado para revisao.');
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel enviar o documento.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.page}>
      <HeaderMain />
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Documentos do prestador</h1>
            <p>Acompanhe a validacao documental do seu perfil profissional.</p>
          </div>
          <div className={styles.status}>
            <span className={styles.muted}>Status geral</span>
            <strong>{status?.documentos_status || 'carregando'}</strong>
            <span className={styles.muted}>
              {status?.podeAparecerNaBusca
                ? 'Seu perfil esta liberado na busca.'
                : 'Seu perfil entra na busca apos aprovacao.'}
            </span>
          </div>
        </header>

        <section className={styles.grid}>
          <div className={styles.panel}>
            <h2>Enviar documento</h2>
            <p className={styles.muted}>
              Use JPG, PNG, WebP ou PDF. Documentos ficam privados e entram em revisao manual.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="tipo_documento">Tipo de documento</label>
                <select
                  className={styles.select}
                  id="tipo_documento"
                  name="tipo_documento"
                  value={tipoDocumento}
                  onChange={(event) => setTipoDocumento(event.target.value)}
                >
                  {OPCOES_DOCUMENTO.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="arquivo">Arquivo</label>
                <input
                  className={styles.input}
                  id="arquivo"
                  name="arquivo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(event) => setArquivo(event.target.files?.[0] || null)}
                />
              </div>
              <button className={styles.button} disabled={enviando} type="submit">
                {enviando ? 'Enviando...' : 'Enviar para revisao'}
              </button>
            </form>
            {sucesso && <div className={styles.success}>{sucesso}</div>}
            {erro && <div className={styles.error}>{erro}</div>}
          </div>

          <div className={styles.panel}>
            <h2>Historico</h2>
            {carregando ? (
              <div className={styles.alert}>Carregando documentos...</div>
            ) : documentosOrdenados.length === 0 ? (
              <div className={styles.alert}>Nenhum documento enviado ainda.</div>
            ) : (
              <div className={styles.list}>
                {documentosOrdenados.map((documento) => (
                  <DocumentoItem documento={documento} key={documento.id} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
