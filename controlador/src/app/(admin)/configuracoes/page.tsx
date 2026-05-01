import styles from "@/styles/admin.module.css";

export default function ConfiguracoesPage() {
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
          <div className={styles.field}><span>Pagamento real</span><strong>Nao implementado neste painel</strong></div>
        </div>
      </section>
    </>
  );
}
