import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { prisma } from "@/lib/prisma";
import { mascararEmail } from "@/lib/sanitize";
import styles from "@/styles/admin.module.css";

export default async function EmailPage() {
  const [usuarios, tokens] = await Promise.all([
    prisma.usuarios.findMany({
      where: { email_confirmado: false },
      take: 50,
      orderBy: { criado_em: "desc" },
      select: { id: true, nome: true, email: true, tipo: true, criado_em: true }
    }),
    prisma.confirmacoes_email.findMany({
      take: 50,
      orderBy: { criado_em: "desc" },
      select: {
        id: true,
        usuario_id: true,
        expiracao: true,
        usado: true,
        criado_em: true,
        usuarios: { select: { nome: true, email: true } }
      }
    })
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Confirmacao de e-mail</h1>
          <p>Usuarios pendentes e historico recente de tokens.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Usuarios sem e-mail confirmado</h2></div>
        {usuarios.length === 0 ? (
          <EmptyState message="Todos os e-mails listados estao confirmados." />
        ) : (
          <DataTable headers={["Nome", "E-mail", "Tipo", "Criado em", "Acoes"]}>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>{mascararEmail(usuario.email)}</td>
                <td>{usuario.tipo}</td>
                <td>{usuario.criado_em?.toLocaleDateString("pt-BR") ?? "-"}</td>
                <td><Link className={styles.button} href={`/usuarios/${usuario.id}`}>Abrir usuario</Link></td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Tokens recentes</h2></div>
        {tokens.length === 0 ? (
          <EmptyState />
        ) : (
          <DataTable headers={["Usuario", "Status", "Expiracao", "Criado em"]}>
            {tokens.map((token) => (
              <tr key={token.id}>
                <td>{token.usuarios.nome}</td>
                <td><BadgeStatus status={token.usado ? "usado" : token.expiracao < new Date() ? "expirado" : "ativo"} /></td>
                <td>{token.expiracao.toLocaleString("pt-BR")}</td>
                <td>{token.criado_em.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
