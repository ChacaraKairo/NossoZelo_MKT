import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";

export default async function LogsPage() {
  const logs = await prisma.logs_acao.findMany({
    take: 100,
    orderBy: { data: "desc" },
    include: { usuarios: { select: { nome: true, email: true } } }
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Logs administrativos</h1>
          <p>Acoes registradas pelo painel controlador.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Eventos recentes</h2></div>
        {logs.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Admin", "Tabela", "Acao", "Data"]}>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.usuarios?.nome ?? "Sistema"}</td>
                <td>{log.tabela_afetada ?? "-"}</td>
                <td><BadgeStatus status={log.acao ?? "evento"} /></td>
                <td>{log.data?.toLocaleString("pt-BR") ?? "-"}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
