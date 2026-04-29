import { StatCard } from "@/components/StatCard";
import { obterResumoDashboard } from "@/lib/queries";
import styles from "@/styles/admin.module.css";

export default async function DashboardPage() {
  const resumo = await obterResumoDashboard();

  const cards = [
    ["Total de usuarios", resumo.totalUsuarios],
    ["Clientes", resumo.totalClientes],
    ["Prestadores", resumo.totalPrestadores],
    ["Prestadores ativos", resumo.prestadoresAtivos],
    ["Pendentes de pagamento", resumo.prestadoresPendentes],
    ["E-mails nao confirmados", resumo.emailsNaoConfirmados],
    ["Assinaturas ativas", resumo.assinaturasAtivas],
    ["Assinaturas pendentes", resumo.assinaturasPendentes],
    ["Assinaturas expiradas", resumo.assinaturasExpiradas],
    ["Contas bloqueadas", resumo.contasBloqueadas]
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Visao operacional do NossoZelo.</p>
        </div>
      </div>

      <section className={styles.grid}>
        {cards.map(([label, value]) => (
          <StatCard key={label} label={String(label)} value={value} />
        ))}
      </section>
    </>
  );
}
