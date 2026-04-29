import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { FilterSelect } from "@/components/FilterSelect";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { listarUsuarios } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

type UsuariosPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function UsuariosPage({ searchParams }: UsuariosPageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams(params as Record<string, string>);
  const { usuarios, page, limit, total } = await listarUsuarios(urlParams);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Usuarios</h1>
          <p>Busca, filtros e acesso ao detalhe de contas.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Lista de usuarios</h2>
          <form className={styles.filters}>
            <SearchInput defaultValue={params.busca} placeholder="Nome, e-mail ou CPF" />
            <FilterSelect
              defaultValue={params.tipo}
              label="Tipo"
              name="tipo"
              options={[
                { label: "Cliente", value: "cliente" },
                { label: "Cuidador", value: "cuidador" },
                { label: "Enfermeiro", value: "enfermeiro" },
                { label: "Acompanhante", value: "acompanhante" },
                { label: "Admin", value: "admin" }
              ]}
            />
            <FilterSelect
              defaultValue={params.email_confirmado}
              label="E-mail"
              name="email_confirmado"
              options={[
                { label: "Confirmado", value: "true" },
                { label: "Nao confirmado", value: "false" }
              ]}
            />
            <FilterSelect
              defaultValue={params.status_cadastro}
              label="Status cadastro"
              name="status_cadastro"
              options={[
                { label: "Ativo", value: "ativo" },
                { label: "Pendente pagamento", value: "pendente_pagamento" },
                { label: "Aguardando confirmacao", value: "aguardando_confirmacao_pagamento" },
                { label: "Inadimplente", value: "inadimplente" },
                { label: "Bloqueado", value: "bloqueado" },
                { label: "Cancelado", value: "cancelado" }
              ]}
            />
            <button className={`${styles.button} ${styles.buttonPrimary}`} type="submit">
              Filtrar
            </button>
          </form>
        </div>

        {usuarios.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DataTable headers={["Nome", "Tipo", "Contato", "Status", "E-mail", "Local", "Acoes"]}>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nome}</strong>
                    <br />
                    {mascararDocumento(usuario.cpf)}
                  </td>
                  <td>{usuario.tipo}</td>
                  <td>
                    {mascararEmail(usuario.email)}
                    <br />
                    {mascararTelefone(usuario.telefone)}
                  </td>
                  <td>
                    <BadgeStatus status={usuario.status_cadastro} />
                  </td>
                  <td>
                    <BadgeStatus status={usuario.email_confirmado} />
                  </td>
                  <td>
                    {[usuario.cidade, usuario.estado].filter(Boolean).join(" / ") || "-"}
                  </td>
                  <td>
                    <Link className={styles.button} href={`/usuarios/${usuario.id}`}>
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination
              basePath="/usuarios"
              limit={limit}
              page={page}
              query={params}
              total={total}
            />
          </>
        )}
      </section>
    </>
  );
}
