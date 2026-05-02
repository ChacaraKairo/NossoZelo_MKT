import { prisma } from "@/lib/prisma";
import styles from "@/styles/admin.module.css";

export default async function ConfiguracoesPage() {
  const planos = await prisma.planos.findMany({
    orderBy: { id: "asc" },
    select: { id: true, nome: true, valor: true }
  });
  const webhookUrl = "/api/webhooks/asaas";

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Configuracoes</h1>
          <p>Informacoes de ambiente do controlador.</p>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}><h2>Ambiente</h2></div>
        <div className={styles.fieldList}>
          <div className={styles.field}><span>App</span><strong>{process.env.NEXT_PUBLIC_APP_NAME ?? "Controlador NossoZelo"}</strong></div>
          <div className={styles.field}><span>Banco</span><strong>{process.env.DATABASE_URL ? "Configurado" : "Nao configurado"}</strong></div>
          <div className={styles.field}><span>JWT admin</span><strong>{process.env.JWT_ADMIN_SECRET ? "Configurado" : "Nao configurado"}</strong></div>
          <div className={styles.field}><span>Webhook Asaas</span><strong>{process.env.ASAAS_WEBHOOK_TOKEN ? "Configurado" : "Nao configurado"}</strong></div>
          <div className={styles.field}><span>Endpoint Asaas</span><strong>{webhookUrl}</strong></div>
          <div className={styles.field}>
            <span>Planos reais</span>
            <strong>
              {planos.length
                ? planos.map((plano) => `${plano.id} - ${plano.nome}: R$ ${Number(plano.valor).toFixed(2).replace(".", ",")}`).join(" | ")
                : "Nenhum plano cadastrado"}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
}
