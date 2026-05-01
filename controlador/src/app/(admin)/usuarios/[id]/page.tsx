import { notFound } from "next/navigation";
import { AdminActionButton } from "@/components/AdminActionButton";
import { BadgeStatus } from "@/components/BadgeStatus";
import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";

type UsuarioDetalheProps = {
  params: Promise<{ id: string }>;
};

export default async function UsuarioDetalhePage({ params }: UsuarioDetalheProps) {
  const { id } = await params;
  const usuario = await prisma.usuarios.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
      tipo: true,
      status_cadastro: true,
      email_confirmado: true,
      cidade: true,
      estado: true,
      cep: true,
      endereco: true,
      bairro: true,
      criado_em: true,
      avaliacao_media: true,
      assinaturas: { orderBy: { criado_em: "desc" }, take: 1, include: { planos: true } },
      servicos: true,
      contratacoes_contratacoes_cliente_idTousuarios: true,
      contratacoes_contratacoes_prestador_idTousuarios: true,
      avaliacoes_avaliacoes_cliente_idTousuarios: true,
      avaliacoes_avaliacoes_prestador_idTousuarios: true
    }
  });

  if (!usuario) notFound();
  const assinatura = usuario.assinaturas[0];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>{usuario.nome}</h1>
          <p>{usuario.tipo} · {usuario.email}</p>
        </div>
      </div>

      <section className={styles.detailGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Dados da conta</h2>
          </div>
          <div className={styles.fieldList}>
            <div className={styles.field}><span>ID</span><strong>{usuario.id}</strong></div>
            <div className={styles.field}><span>CPF</span><strong>{usuario.cpf}</strong></div>
            <div className={styles.field}><span>Telefone</span><strong>{usuario.telefone ?? "-"}</strong></div>
            <div className={styles.field}><span>Status</span><strong><BadgeStatus status={usuario.status_cadastro} /></strong></div>
            <div className={styles.field}><span>E-mail confirmado</span><strong><BadgeStatus status={usuario.email_confirmado} /></strong></div>
            <div className={styles.field}><span>Local</span><strong>{[usuario.cidade, usuario.estado].filter(Boolean).join(" / ") || "-"}</strong></div>
            <div className={styles.field}><span>Endereco</span><strong>{[usuario.endereco, usuario.bairro, usuario.cep].filter(Boolean).join(" - ") || "-"}</strong></div>
            <div className={styles.field}><span>Criado em</span><strong>{usuario.criado_em?.toLocaleDateString("pt-BR") ?? "-"}</strong></div>
          </div>
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Acoes</h2>
          </div>
          <div className={styles.fieldList}>
            <AdminActionButton
              confirmMessage="Bloquear este usuario?"
              endpoint={`/api/usuarios/${usuario.id}/bloquear`}
              label="Bloquear"
              variant="danger"
            />
            <AdminActionButton
              confirmMessage="Liberar este usuario?"
              endpoint={`/api/usuarios/${usuario.id}/liberar`}
              label="Liberar"
              variant="primary"
            />
            <AdminActionButton
              confirmMessage="Marcar o e-mail deste usuario como confirmado?"
              endpoint={`/api/usuarios/${usuario.id}/confirmar-email`}
              label="Confirmar e-mail"
            />
          </div>
        </aside>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Resumo operacional</h2></div>
        <div className={styles.fieldList}>
          <div className={styles.field}><span>Assinatura atual</span><strong>{assinatura ? <BadgeStatus status={assinatura.status} /> : "Sem assinatura"}</strong></div>
          <div className={styles.field}><span>Plano</span><strong>{assinatura?.planos.nome ?? "-"}</strong></div>
          <div className={styles.field}><span>Servicos</span><strong>{usuario.servicos.length}</strong></div>
          <div className={styles.field}><span>Contratacoes como cliente</span><strong>{usuario.contratacoes_contratacoes_cliente_idTousuarios.length}</strong></div>
          <div className={styles.field}><span>Contratacoes como prestador</span><strong>{usuario.contratacoes_contratacoes_prestador_idTousuarios.length}</strong></div>
          <div className={styles.field}><span>Avaliacoes recebidas</span><strong>{usuario.avaliacoes_avaliacoes_prestador_idTousuarios.length}</strong></div>
        </div>
      </section>
    </>
  );
}
