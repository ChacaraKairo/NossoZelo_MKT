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
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const variantClass =
    variant === "primary" ? styles.buttonPrimary : variant === "danger" ? styles.buttonDanger : "";

  async function executar() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    setFeedback({ tipo: "sucesso", texto: "Processando acao..." });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setFeedback({ tipo: "erro", texto: data?.error ?? "Nao foi possivel concluir a acao." });
        return;
      }

      setFeedback({ tipo: "sucesso", texto: data?.message ?? "Acao concluida com sucesso." });
      setTimeout(() => router.refresh(), 650);
    } catch {
      setFeedback({ tipo: "erro", texto: "Falha de conexao ao executar a acao." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.actionStack}>
      <button className={`${styles.button} ${variantClass}`} disabled={loading} onClick={executar} type="button">
        {loading ? "Processando..." : label}
      </button>
      {feedback ? (
        <span
          aria-live="polite"
          className={feedback.tipo === "sucesso" ? styles.inlineSuccess : styles.inlineError}
        >
          {feedback.texto}
        </span>
      ) : null}
    </div>
  );
}
