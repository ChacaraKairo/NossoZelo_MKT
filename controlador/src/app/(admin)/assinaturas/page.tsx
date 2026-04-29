import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { FilterSelect } from "@/components/FilterSelect";
import { SearchInput } from "@/components/SearchInput";
import { prisma } from "@/lib/prisma";
import { normalizarBusca } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

type AssinaturasPageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AssinaturasPage({ searchParams }: AssinaturasPageProps) {
  const params = await searchParams;
  const status = normalizarBusca(params.status ?? null);
  const prestador = normalizarBusca(params.prestador ?? null);
  const where: Prisma.assinaturasWhereInput = {};
  if (status) where.status = status as Prisma.Enumassinaturas_statusFilter["equals"];
  if (prestador) where.usuarios = { nome: { contains: prestador } };

  const assinaturas = await prisma.assinaturas.findMany({
    where,
    take: 100,
    orderBy: { criado_em: "desc" },
    include: { usuarios: true, planos: true }
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Assinaturas</h1>
          <p>Acompanhamento de planos de prestadores e status do gateway.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Assinaturas recentes</h2>
          <form className={styles.filters}>
            <SearchInput name="prestador" defaultValue={params.prestador} placeholder="Prestador" />
            <FilterSelect
              defaultValue={params.status}
              label="Status"
              name="status"
              options={[
                { label: "Ativa", value: "ativa" },
                { label: "Aguardando", value: "aguardando_confirmacao" },
                { label: "Pendente", value: "pendente" },
                { label: "Atrasada", value: "atrasada" },
                { label: "Bloqueada", value: "bloqueada" },
                { label: "Cancelada", value: "cancelada" },
                { label: "Falhou", value: "falhou" },
                { label: "Expirada", value: "expirada" }
              ]}
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">Filtrar</button>
          </form>
        </div>
        {assinaturas.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Prestador", "Plano", "Status", "Gateway", "Proximo vencimento", "Confirmacao expira", "Acoes"]}>
            {assinaturas.map((assinatura) => (
              <tr key={assinatura.id}>
                <td>{assinatura.usuarios.nome}</td>
                <td>{assinatura.planos.nome}</td>
                <td><BadgeStatus status={assinatura.status} /></td>
                <td>{assinatura.gateway}</td>
                <td>{assinatura.data_proximo_vencimento?.toLocaleDateString("pt-BR") ?? "-"}</td>
                <td>{assinatura.confirmacao_expira_em?.toLocaleString("pt-BR") ?? "-"}</td>
                <td><Link className={styles.button} href={`/prestadores/${assinatura.prestador_id}`}>Prestador</Link></td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
