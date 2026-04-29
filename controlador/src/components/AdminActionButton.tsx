"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/styles/admin.module.css";

type AdminActionButtonProps = {
  endpoint: string;
  label: string;
  confirmMessage: string;
  variant?: "primary" | "danger" | "default";
  body?: Record<string, unknown>;
};

export function AdminActionButton({
  endpoint,
  label,
  confirmMessage,
  variant = "default",
  body = {}
}: AdminActionButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const variantClass =
    variant === "primary" ? styles.buttonPrimary : variant === "danger" ? styles.buttonDanger : "";

  async function executar() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      window.alert(data?.error ?? "Nao foi possivel concluir a acao.");
      return;
    }

    router.refresh();
  }

  return (
    <button className={`${styles.button} ${variantClass}`} disabled={loading} onClick={executar} type="button">
      {loading ? "Processando..." : label}
    </button>
  );
}
