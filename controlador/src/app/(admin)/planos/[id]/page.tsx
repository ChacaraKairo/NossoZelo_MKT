import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanoForm } from "@/components/PlanoForm";
import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";

type PlanoDetalhePageProps = { params: Promise<{ id: string }> };

export default async function PlanoDetalhePage({ params }: PlanoDetalhePageProps) {
  const { id } = await params;
  const plano = await prisma.planos.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { assinaturas: true } } }
  });

  if (!plano) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Editar plano</h1>
          <p>{plano._count.assinaturas} assinatura(s) vinculada(s).</p>
        </div>
        <Link className={styles.button} href="/planos">Voltar</Link>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>{plano.nome}</h2>
        </div>
        <PlanoForm
          modo="editar"
          plano={{
            id: plano.id,
            nome: plano.nome,
            descricao: plano.descricao,
            valor: Number(plano.valor),
            beneficios: plano.beneficios,
            ordem: plano.ordem,
            ativo: plano.ativo
          }}
        />
      </section>
    </>
  );
}
