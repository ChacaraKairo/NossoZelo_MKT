import styles from "@/styles/admin.module.css";

type BadgeStatusProps = {
  status?: string | null | boolean;
};

function classeStatus(status?: string | null | boolean) {
  if (status === true) return styles.badgeSuccess;
  if (status === false) return styles.badgeWarning;
  const texto = String(status ?? "").toLowerCase();

  if (["ativo", "ativa", "confirmado", "true"].includes(texto)) return styles.badgeSuccess;
  if (["pendente", "aguardando_confirmacao", "aguardando_confirmacao_pagamento", "pendente_pagamento"].includes(texto)) {
    return styles.badgeWarning;
  }
  if (["bloqueado", "cancelado", "cancelada", "falhou", "expirada", "inadimplente"].includes(texto)) {
    return styles.badgeDanger;
  }
  return styles.badgeNeutral;
}

export function BadgeStatus({ status }: BadgeStatusProps) {
  const label = typeof status === "boolean" ? (status ? "sim" : "nao") : status ?? "sem status";
  return <span className={`${styles.badge} ${classeStatus(status)}`}>{String(label).replaceAll("_", " ")}</span>;
}
