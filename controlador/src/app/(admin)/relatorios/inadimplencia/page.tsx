import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { prisma } from "@/lib/prisma";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

function data(valor?: Date | null) {
  if (!valor) return "-";
  return valor.toLocaleDateString("pt-BR");
}

function moeda(valor?: number | string | { toString(): string } | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "-";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RelatorioInadimplenciaPage() {
  const statusCriticos = ["atrasada", "bloqueada", "falhou", "expirada", "cancelada"] as const;
  const [assinaturas, resumo] = await Promise.all([
    prisma.assinaturas.findMany({
      where: { status: { in: [...statusCriticos] } },
      orderBy: [{ data_proximo_vencimento: "asc" }, { atualizado_em: "desc" }],
      take: 200,
      include: { usuarios: true, planos: true }
    }),
    prisma.assinaturas.groupBy({
      by: ["status"],
      where: { status: { in: [...statusCriticos] } },
      _count: { _all: true }
    })
  ]);

  const totalValorMensalRisco = assinaturas.reduce(
    (total, assinatura) => total + Number(assinatura.planos.valor || 0),
    0
  );

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Relatório de inadimplência</h1>
          <p>Prestadores fora da operação por atraso, bloqueio, falha, expiração ou cancelamento.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.cardLabel}>Assinaturas em risco</span>
          <strong className={styles.cardValue}>{assinaturas.length}</strong>
        </article>
        <article className={styles.card}>
          <span className={styles.cardLabel}>Receita mensal em risco</span>
          <strong className={styles.cardValue}>{moeda(totalValorMensalRisco)}</strong>
        </article>
        {resumo.map((item) => (
          <article className={styles.card} key={item.status}>
            <span className={styles.cardLabel}>{item.status}</span>
            <strong className={styles.cardValue}>{item._count._all}</strong>
          </article>
        ))}
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Prestadores inadimplentes</h2>
        </div>
        {assinaturas.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Prestador", "Contato", "Plano", "Status", "Vencimento", "Tolerancia", "Acoes"]}>
            {assinaturas.map((assinatura) => (
              <tr key={assinatura.id}>
                <td>
                  <strong>{assinatura.usuarios.nome}</strong>
                  <span className={styles.tableSubtext}>{mascararDocumento(assinatura.usuarios.cpf)}</span>
                </td>
                <td>
                  {mascararEmail(assinatura.usuarios.email)}
                  <span className={styles.tableSubtext}>{mascararTelefone(assinatura.usuarios.telefone)}</span>
                </td>
                <td>
                  {assinatura.planos.nome}
                  <span className={styles.tableSubtext}>{moeda(assinatura.planos.valor)}</span>
                </td>
                <td><BadgeStatus status={assinatura.status} /></td>
                <td>{data(assinatura.data_proximo_vencimento)}</td>
                <td>{data(assinatura.periodo_tolerancia_ate)}</td>
                <td>
                  <Link className={styles.button} href={`/assinaturas/${assinatura.id}`}>
                    Ver assinatura
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
