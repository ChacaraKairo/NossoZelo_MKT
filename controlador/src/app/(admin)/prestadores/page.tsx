import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { FilterSelect } from "@/components/FilterSelect";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { listarPrestadores } from "@/lib/queries";
import { mascararEmail } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

type PrestadoresPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function PrestadoresPage({ searchParams }: PrestadoresPageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams(params as Record<string, string>);
  const { prestadores, page, limit, total } = await listarPrestadores(urlParams);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Prestadores</h1>
          <p>Controle de cuidadores, enfermeiros e acompanhantes.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Lista de prestadores</h2>
          <form className={styles.filters}>
            <SearchInput defaultValue={params.busca} placeholder="Nome ou e-mail" />
            <FilterSelect
              defaultValue={params.tipo}
              label="Tipo"
              name="tipo"
              options={[
                { label: "Cuidador", value: "cuidador" },
                { label: "Enfermeiro", value: "enfermeiro" },
                { label: "Acompanhante", value: "acompanhante" }
              ]}
            />
            <FilterSelect
              defaultValue={params.assinatura_status}
              label="Assinatura"
              name="assinatura_status"
              options={[
                { label: "Ativa", value: "ativa" },
                { label: "Aguardando", value: "aguardando_confirmacao" },
                { label: "Pendente", value: "pendente" },
                { label: "Falhou", value: "falhou" },
                { label: "Expirada", value: "expirada" },
                { label: "Bloqueada", value: "bloqueada" }
              ]}
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">Filtrar</button>
          </form>
        </div>

        {prestadores.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DataTable headers={["Nome", "Tipo", "Contato", "Cadastro", "E-mail", "Assinatura", "Acoes"]}>
              {prestadores.map((prestador) => {
                const assinatura = prestador.assinaturas[0];
                return (
                  <tr key={prestador.id}>
                    <td><strong>{prestador.nome}</strong></td>
                    <td>{prestador.tipo}</td>
                    <td>{mascararEmail(prestador.email)}</td>
                    <td><BadgeStatus status={prestador.status_cadastro} /></td>
                    <td><BadgeStatus status={prestador.email_confirmado} /></td>
                    <td><BadgeStatus status={assinatura?.status ?? "sem assinatura"} /></td>
                    <td><Link className={styles.button} href={`/prestadores/${prestador.id}`}>Ver detalhes</Link></td>
                  </tr>
                );
              })}
            </DataTable>
            <Pagination basePath="/prestadores" limit={limit} page={page} query={params} total={total} />
          </>
        )}
      </section>
    </>
  );
}
