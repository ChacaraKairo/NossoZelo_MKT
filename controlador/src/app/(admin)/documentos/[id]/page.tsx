import { notFound } from "next/navigation";
import { BadgeStatus } from "@/components/BadgeStatus";
import { obterDocumento } from "@/lib/documentos";
import styles from "@/styles/admin.module.css";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function DocumentoDetalhePage({ params }: PageProps) {
  const { id } = await params;
  const documento = await obterDocumento(Number(id));
  if (!documento) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Documento #{documento.id}</h1>
          <p>{documento.usuarios.nome} · {documento.usuarios.tipo}</p>
        </div>
        <BadgeStatus status={documento.status} />
      </div>

      <section className={styles.panel}>
        <div className={styles.fieldList}>
          <div className={styles.field}><span>Tipo</span><strong>{documento.tipoDocumento?.nome || documento.tipo_documento}</strong></div>
          <div className={styles.field}><span>Codigo</span><strong>{documento.tipo_documento}</strong></div>
          <div className={styles.field}><span>Categoria</span><strong>{documento.tipoDocumento?.categoria || "-"}</strong></div>
          <div className={styles.field}><span>Arquivo privado</span><strong>{documento.arquivo_chave}</strong></div>
          <div className={styles.field}><span>MIME</span><strong>{documento.mime_type || "-"}</strong></div>
          <div className={styles.field}><span>Tamanho</span><strong>{documento.tamanho_bytes || 0} bytes</strong></div>
          <div className={styles.field}><span>Identidade</span><strong>{documento.usuarios.identidade_status}</strong></div>
          <div className={styles.field}><span>Profissional</span><strong>{documento.usuarios.profissional_status}</strong></div>
          <div className={styles.field}><span>Sinal</span><strong>{documento.analises[0]?.sinal || "sem analise"}</strong></div>
          <div className={styles.field}><span>Score</span><strong>{documento.analises[0]?.score?.toString() || "-"}</strong></div>
          <div className={styles.field}><span>Motivo da analise</span><strong>{documento.analises[0]?.motivo || "-"}</strong></div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Historico de revisao</h2></div>
        {documento.revisoes.length === 0 ? (
          <p className={styles.empty}>Nenhuma revisao manual registrada.</p>
        ) : (
          <div className={styles.fieldList}>
            {documento.revisoes.map((revisao) => (
              <div className={styles.field} key={revisao.id}>
                <span>{revisao.criado_em.toLocaleString("pt-BR")}</span>
                <strong>{revisao.decisao}</strong>
                <span>{revisao.motivo}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
