import styles from "@/styles/admin.module.css";

export function ErrorState({ message = "Nao foi possivel carregar os dados." }: { message?: string }) {
  return <div className={styles.empty}>{message}</div>;
}
