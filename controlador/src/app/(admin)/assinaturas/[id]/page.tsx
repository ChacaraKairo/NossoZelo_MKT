import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeStatus } from "@/components/BadgeStatus";
import { AssinaturaAdminActions } from "@/components/AssinaturaAdminActions";
import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";

type AssinaturaDetalhePageProps = { params: Promise<{ id: string }> };

function data(valor?: Date | string | null) {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("pt-BR");
}

function texto(valor?: string | number | null) {
  return valor === undefined || valor === null || valor === "" ? "-" : String(valor);
}

function moeda(valor?: number | string | { toString(): string } | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "-";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AssinaturaDetalhePage({ params }: AssinaturaDetalhePageProps) {
  const { id } = await params;
  const assinatura = await prisma.assinaturas.findUnique({
    where: { id: Number(id) },
    include: { usuarios: true, planos: true }
  });

  if (!assinatura) notFound();

  const eventosFinanceiros = await prisma.asaas_webhook_logs.findMany({
    where: {
      OR: [
        { assinatura_id: assinatura.id },
        assinatura.gateway_subscription_id
          ? { subscription_id: assinatura.gateway_subscription_id }
          : undefined
      ].filter(Boolean) as { assinatura_id?: number; subscription_id?: string }[]
    },
    orderBy: { criado_em: "desc" },
    take: 20,
    select: {
      id: true,
      event: true,
      status_processamento: true,
      motivo: true,
      payment_id: true,
      valor: true,
      pago_em: true,
      assinatura_status_antes: true,
      assinatura_status_depois: true,
      criado_em: true
    }
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Assinatura #{assinatura.id}</h1>
          <p>Detalhe financeiro e operacional da assinatura do prestador.</p>
        </div>
        <Link className={styles.button} href="/assinaturas">Voltar</Link>
      </div>

      <div className={styles.detailGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Dados da assinatura</h2>
            <BadgeStatus status={assinatura.status} />
          </div>
          <div className={styles.fieldList}>
            <div className={styles.field}><span>Prestador</span><strong>{assinatura.usuarios.nome}</strong></div>
            <div className={styles.field}><span>E-mail</span><strong>{assinatura.usuarios.email}</strong></div>
            <div className={styles.field}><span>Plano</span><strong>{assinatura.planos.nome}</strong></div>
            <div className={styles.field}><span>Valor</span><strong>{moeda(assinatura.planos.valor)}</strong></div>
            <div className={styles.field}><span>Status</span><strong>{assinatura.status}</strong></div>
            <div className={styles.field}><span>Gateway</span><strong>{texto(assinatura.gateway)}</strong></div>
            <div className={styles.field}><span>Gateway customer</span><strong>{texto(assinatura.gateway_customer_id)}</strong></div>
            <div className={styles.field}><span>Gateway subscription</span><strong>{texto(assinatura.gateway_subscription_id)}</strong></div>
            <div className={styles.field}><span>Gateway status</span><strong>{texto(assinatura.gateway_status)}</strong></div>
            <div className={styles.field}><span>Ultimo pagamento</span><strong>{data(assinatura.data_ultimo_pagamento)}</strong></div>
            <div className={styles.field}><span>Proximo vencimento</span><strong>{data(assinatura.data_proximo_vencimento)}</strong></div>
            <div className={styles.field}><span>Tolerancia ate</span><strong>{data(assinatura.periodo_tolerancia_ate)}</strong></div>
            <div className={styles.field}><span>Confirmacao expira</span><strong>{data(assinatura.confirmacao_expira_em)}</strong></div>
            <div className={styles.field}><span>Cancelada em</span><strong>{data(assinatura.cancelada_em)}</strong></div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Ações administrativas</h2>
          </div>
          <AssinaturaAdminActions id={assinatura.id} statusAtual={assinatura.status} />
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Histórico financeiro</h2>
        </div>
        {eventosFinanceiros.length === 0 ? (
          <div className={styles.empty}>Nenhum evento financeiro registrado para esta assinatura.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                  <th>Status local</th>
                  <th>Recebido em</th>
                </tr>
              </thead>
              <tbody>
                {eventosFinanceiros.map((evento) => (
                  <tr key={evento.id}>
                    <td>
                      {evento.event}
                      {evento.motivo && <span className={styles.tableSubtext}>{evento.motivo}</span>}
                    </td>
                    <td><BadgeStatus status={evento.status_processamento} /></td>
                    <td>{texto(evento.payment_id)}</td>
                    <td>{moeda(evento.valor)}</td>
                    <td>{texto(evento.assinatura_status_antes)} → {texto(evento.assinatura_status_depois)}</td>
                    <td>{data(evento.pago_em || evento.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
