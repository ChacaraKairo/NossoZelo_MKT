import Link from "next/link";
import { BadgeStatus } from "@/components/BadgeStatus";
import { DataTable } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";
import styles from "@/styles/admin.module.css";

export default async function PendenciasPage() {
  const [emails, semAssinatura, aguardando, expiradas] = await Promise.all([
    prisma.usuarios.findMany({ where: { email_confirmado: false }, take: 20, orderBy: { criado_em: "desc" } }),
    prisma.usuarios.findMany({
      where: { tipo: { in: [...tiposPrestador] }, NOT: { assinaturas: { some: { status: "ativa" } } } },
      take: 20,
      orderBy: { criado_em: "desc" }
    }),
    prisma.assinaturas.findMany({ where: { status: "aguardando_confirmacao" }, take: 20, include: { usuarios: true, planos: true } }),
    prisma.assinaturas.findMany({ where: { status: "expirada" }, take: 20, include: { usuarios: true, planos: true } })
  ]);

  const linhas = [
    ...emails.map((usuario) => ({ tipo: "E-mail nao confirmado", nome: usuario.nome, status: usuario.email_confirmado ? "confirmado" : "pendente", href: `/usuarios/${usuario.id}` })),
    ...semAssinatura.map((usuario) => ({ tipo: "Prestador sem assinatura ativa", nome: usuario.nome, status: usuario.status_cadastro, href: `/prestadores/${usuario.id}` })),
    ...aguardando.map((assinatura) => ({ tipo: "Pagamento aguardando confirmacao", nome: assinatura.usuarios.nome, status: assinatura.status, href: `/prestadores/${assinatura.prestador_id}` })),
    ...expiradas.map((assinatura) => ({ tipo: "Assinatura expirada", nome: assinatura.usuarios.nome, status: assinatura.status, href: `/prestadores/${assinatura.prestador_id}` }))
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Pendencias</h1>
          <p>Itens que precisam de acompanhamento administrativo.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Fila operacional</h2></div>
        {linhas.length === 0 ? (
          <EmptyState message="Nenhuma pendencia encontrada." />
        ) : (
          <DataTable headers={["Tipo", "Usuario", "Status", "Acoes"]}>
            {linhas.map((linha, index) => (
              <tr key={`${linha.href}-${index}`}>
                <td>{linha.tipo}</td>
                <td>{linha.nome}</td>
                <td><BadgeStatus status={linha.status} /></td>
                <td><Link className={styles.button} href={linha.href}>Analisar</Link></td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </>
  );
}
