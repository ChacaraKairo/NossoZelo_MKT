import { notFound } from "next/navigation";
import { AdminActionButton } from "@/components/AdminActionButton";
import { BadgeStatus } from "@/components/BadgeStatus";
import { prisma } from "@/lib/prisma";
import { tiposPrestador } from "@/lib/queries";
import styles from "@/styles/admin.module.css";

type PrestadorDetalheProps = { params: Promise<{ id: string }> };

export default async function PrestadorDetalhePage({ params }: PrestadorDetalheProps) {
  const { id } = await params;
  const prestador = await prisma.usuarios.findFirst({
    where: { id, tipo: { in: [...tiposPrestador] } },
    include: {
      assinaturas: { orderBy: { criado_em: "desc" }, take: 1, include: { planos: true } },
      servicos: true,
      cuidadores: true,
      enfermeiros: true,
      acompanhantes: true,
      avaliacoes_avaliacoes_prestador_idTousuarios: true
    }
  });

  if (!prestador) notFound();
  const assinatura = prestador.assinaturas[0];
  const dadosProfissionais = prestador.cuidadores ?? prestador.enfermeiros ?? prestador.acompanhantes;
  const ativo = prestador.email_confirmado && prestador.status_cadastro === "ativo" && assinatura?.status === "ativa";

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>{prestador.nome}</h1>
          <p>{prestador.tipo} · perfil profissional {ativo ? "ativo" : "inativo"}</p>
        </div>
      </div>

      <section className={styles.detailGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h2>Status profissional</h2></div>
          <div className={styles.fieldList}>
            <div className={styles.field}><span>Cadastro</span><strong><BadgeStatus status={prestador.status_cadastro} /></strong></div>
            <div className={styles.field}><span>E-mail confirmado</span><strong><BadgeStatus status={prestador.email_confirmado} /></strong></div>
            <div className={styles.field}><span>Assinatura</span><strong><BadgeStatus status={assinatura?.status ?? "sem assinatura"} /></strong></div>
            <div className={styles.field}><span>Aparece na busca</span><strong><BadgeStatus status={ativo} /></strong></div>
            <div className={styles.field}><span>Recebe pedidos</span><strong><BadgeStatus status={ativo} /></strong></div>
            <div className={styles.field}><span>Avaliacao media</span><strong>{String(prestador.avaliacao_media ?? "0")}</strong></div>
          </div>
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}><h2>Acoes</h2></div>
          <div className={styles.fieldList}>
            <AdminActionButton
              confirmMessage="Bloquear o perfil profissional deste prestador?"
              endpoint={`/api/prestadores/${prestador.id}/bloquear`}
              label="Bloquear perfil"
              variant="danger"
            />
            <AdminActionButton
              confirmMessage="Liberar o perfil profissional deste prestador?"
              endpoint={`/api/prestadores/${prestador.id}/liberar`}
              label="Liberar perfil"
              variant="primary"
            />
          </div>
        </aside>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Dados profissionais</h2></div>
        <div className={styles.fieldList}>
          <div className={styles.field}><span>Bio</span><strong>{"bio" in (dadosProfissionais ?? {}) ? dadosProfissionais?.bio ?? "-" : "-"}</strong></div>
          <div className={styles.field}><span>Servicos cadastrados</span><strong>{prestador.servicos.length}</strong></div>
          <div className={styles.field}><span>Plano</span><strong>{assinatura?.planos.nome ?? "-"}</strong></div>
          <div className={styles.field}><span>Gateway</span><strong>{assinatura?.gateway ?? "-"}</strong></div>
        </div>
      </section>
    </>
  );
}
