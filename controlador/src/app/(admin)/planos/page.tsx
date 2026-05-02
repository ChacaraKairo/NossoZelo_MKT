import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { FilterSelect } from "@/components/FilterSelect";
import { PlanoStatusButton } from "@/components/PlanoStatusButton";
import { SearchInput } from "@/components/SearchInput";
import { prisma } from "@/lib/prisma";
import { normalizarBusca } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

type PlanosPageProps = { searchParams: Promise<Record<string, string | undefined>> };

function moeda(valor: Prisma.Decimal | number | string) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PlanosPage({ searchParams }: PlanosPageProps) {
  const params = await searchParams;
  const busca = normalizarBusca(params.busca ?? null);
  const status = normalizarBusca(params.status ?? null);
  const where: Prisma.planosWhereInput = {};

  if (busca) where.nome = { contains: busca };
  if (status === "ativo") where.ativo = true;
  if (status === "inativo") where.ativo = false;

  const planos = await prisma.planos.findMany({
    where,
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
    include: { _count: { select: { assinaturas: true } } }
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Planos</h1>
          <p>Controle os planos disponíveis para assinatura de prestadores.</p>
        </div>
        <Link className={`${styles.button} ${styles.buttonPrimary}`} href="/planos/novo">Novo plano</Link>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Planos cadastrados</h2>
          <form className={styles.filters}>
            <SearchInput name="busca" defaultValue={params.busca} placeholder="Nome do plano" />
            <FilterSelect
              defaultValue={params.status}
              label="Status"
              name="status"
              options={[
                { label: "Ativo", value: "ativo" },
                { label: "Inativo", value: "inativo" }
              ]}
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">Filtrar</button>
          </form>
        </div>
        {planos.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Nome", "Valor", "Status", "Ordem", "Assinaturas", "Ações"]}>
            {planos.map((plano) => (
              <tr key={plano.id}>
                <td>
                  {plano.nome}
                  {plano.descricao && <span className={styles.tableSubtext}>{plano.descricao}</span>}
                </td>
                <td>{moeda(plano.valor)}</td>
                <td><BadgeStatus status={plano.ativo ? "ativo" : "inativo"} /></td>
                <td>{plano.ordem}</td>
                <td>{plano._count.assinaturas}</td>
                <td>
                  <div className={styles.actionStack}>
                    <Link className={styles.button} href={`/planos/${plano.id}`}>Editar</Link>
                    <PlanoStatusButton id={plano.id} ativo={plano.ativo} />
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
