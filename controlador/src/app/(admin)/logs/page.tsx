import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { FilterSelect } from "@/components/FilterSelect";
import { SearchInput } from "@/components/SearchInput";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/prisma";
import { normalizarBusca } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

type LogsPageProps = { searchParams: Promise<Record<string, string | undefined>> };

function formatarData(data?: Date | null) {
  return data ? data.toLocaleString("pt-BR") : "-";
}

function resumoPayload(payload: Prisma.JsonValue) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "-";

  const payment = (payload as { payment?: Record<string, unknown> }).payment;
  if (!payment) return "-";

  const billingType = payment.billingType ? `Tipo: ${payment.billingType}` : null;
  const invoiceUrl = payment.invoiceUrl ? "Fatura recebida" : null;
  return [billingType, invoiceUrl].filter(Boolean).join(" | ") || "-";
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const params = await searchParams;
  const status = normalizarBusca(params.status ?? null);
  const event = normalizarBusca(params.event ?? null);
  const prestador = normalizarBusca(params.prestador ?? null);

  const where: Prisma.asaas_webhook_logsWhereInput = {};
  if (status) where.status_processamento = status;
  if (event) where.event = { contains: event };
  if (prestador) {
    where.OR = [
      { prestador_id: { contains: prestador } },
      { subscription_id: { contains: prestador } },
      { payment_id: { contains: prestador } }
    ];
  }

  const [total, sucessos, erros, ignorados, logs, logsAdministrativos] = await Promise.all([
    prisma.asaas_webhook_logs.count({ where }),
    prisma.asaas_webhook_logs.count({ where: { ...where, status_processamento: "sucesso" } }),
    prisma.asaas_webhook_logs.count({ where: { ...where, status_processamento: "erro" } }),
    prisma.asaas_webhook_logs.count({ where: { ...where, status_processamento: "ignorado" } }),
    prisma.asaas_webhook_logs.findMany({
      where,
      take: 100,
      orderBy: { criado_em: "desc" }
    }),
    prisma.logs_acao.findMany({
      take: 50,
      orderBy: { data: "desc" },
      include: { usuarios: { select: { nome: true, email: true } } }
    })
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Logs Asaas</h1>
          <p>Auditoria das confirmacoes de pagamento recebidas pelo webhook.</p>
        </div>
      </div>

      <section className={styles.grid}>
        <StatCard label="Eventos listados" value={total} />
        <StatCard label="Processados" value={sucessos} />
        <StatCard label="Com erro" value={erros} />
        <StatCard label="Ignorados" value={ignorados} />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Recebimentos recentes</h2>
          <form className={styles.filters}>
            <SearchInput name="prestador" defaultValue={params.prestador} placeholder="Prestador, assinatura ou pagamento" />
            <SearchInput name="event" defaultValue={params.event} placeholder="Evento Asaas" />
            <FilterSelect
              defaultValue={params.status}
              label="Status"
              name="status"
              options={[
                { label: "Sucesso", value: "sucesso" },
                { label: "Erro", value: "erro" },
                { label: "Ignorado", value: "ignorado" },
                { label: "Recebido", value: "recebido" }
              ]}
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">Filtrar</button>
          </form>
        </div>
        {logs.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Recebido em", "Evento", "Status", "Prestador", "Pagamento", "Assinatura", "Valor", "Resultado", "Atalho"]}>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatarData(log.criado_em)}</td>
                <td>{log.event}</td>
                <td><BadgeStatus status={log.status_processamento} /></td>
                <td>{log.prestador_id ?? "-"}</td>
                <td>
                  <strong>{log.payment_id ?? "-"}</strong>
                  <span className={styles.tableSubtext}>{resumoPayload(log.payload)}</span>
                </td>
                <td>{log.subscription_id ?? "-"}</td>
                <td>{log.valor ? `R$ ${Number(log.valor).toFixed(2).replace(".", ",")}` : "-"}</td>
                <td>
                  <strong>{log.assinatura_status_depois?.replaceAll("_", " ") ?? "-"}</strong>
                  <span className={styles.tableSubtext}>{log.motivo ?? "-"}</span>
                </td>
                <td>
                  {log.prestador_id ? (
                    <Link className={styles.button} href={`/prestadores/${log.prestador_id}`}>Prestador</Link>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Eventos administrativos</h2></div>
        {logsAdministrativos.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Admin", "Tabela", "Acao", "Data"]}>
            {logsAdministrativos.map((log) => (
              <tr key={log.id}>
                <td>{log.usuarios?.nome ?? "Sistema"}</td>
                <td>{log.tabela_afetada ?? "-"}</td>
                <td><BadgeStatus status={log.acao ?? "evento"} /></td>
                <td>{formatarData(log.data)}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
