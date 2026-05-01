"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/styles/admin.module.css";

type HeaderProps = {
  nome: string;
  email: string;
};

export function Header({ nome, email }: HeaderProps) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <strong>{nome}</strong>
        <span>{email}</span>
      </div>
      <div className={styles.headerActions}>
        <button className={styles.button} onClick={sair} disabled={saindo} type="button">
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}
