import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { listarDocumentosPendentes } from "@/lib/documentos";
import styles from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default async function DocumentosPage() {
  const documentos = await listarDocumentosPendentes();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Documentos</h1>
          <p>Revisao manual de documentos enviados por prestadores.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Fila de revisao</h2>
        </div>

        {documentos.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Prestador", "Documento", "Status", "Arquivo", "Decisao"]}>
            {documentos.map((documento) => (
              <tr key={documento.id}>
                <td>
                  <strong>{documento.usuarios.nome}</strong>
                  <span className={styles.tableSubtext}>
                    {documento.usuarios.tipo} · {documento.usuarios.email}
                  </span>
                </td>
                <td>
                  {documento.tipo_documento}
                  <span className={styles.tableSubtext}>
                    Enviado em {documento.criado_em.toLocaleString("pt-BR")}
                  </span>
                </td>
                <td><BadgeStatus status={documento.status} /></td>
                <td>
                  <code>{documento.arquivo_chave}</code>
                  <span className={styles.tableSubtext}>Arquivo privado, sem URL publica.</span>
                </td>
                <td>
                  <form className={styles.actionStack} method="post" action={`/api/documentos/${documento.id}/aprovar`}>
                    <input className={styles.input} name="motivo" placeholder="Motivo da decisao" required />
                    <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">Aprovar</button>
                  </form>
                  <form className={styles.actionStack} method="post" action={`/api/documentos/${documento.id}/recusar`}>
                    <input className={styles.input} name="motivo" placeholder="Motivo da recusa" required />
                    <button className={`${styles.button} ${styles.buttonDanger}`} type="submit">Recusar</button>
                  </form>
                  <Link className={styles.button} href={`/documentos/${documento.id}`}>Detalhes</Link>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
