import Link from "next/link";
import { PlanoForm } from "@/components/PlanoForm";
import styles from "@/styles/admin.module.css";

export default function NovoPlanoPage() {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Novo plano</h1>
          <p>Cadastre um plano de assinatura para prestadores.</p>
        </div>
        <Link className={styles.button} href="/planos">Voltar</Link>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Dados do plano</h2>
        </div>
        <PlanoForm modo="novo" />
      </section>
    </>
  );
}
