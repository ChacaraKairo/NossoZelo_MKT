import styles from "@/styles/admin.module.css";

export function EmptyState({ message = "Nenhum registro encontrado." }: { message?: string }) {
  return <div className={styles.empty}>{message}</div>;
}
