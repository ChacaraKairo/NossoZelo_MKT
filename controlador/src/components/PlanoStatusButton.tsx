"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/styles/admin.module.css";

type PlanoStatusButtonProps = {
  id: number;
  ativo: boolean;
};

export function PlanoStatusButton({ id, ativo }: PlanoStatusButtonProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alterar() {
    setCarregando(true);
    setErro(null);
    try {
      const response = await fetch(`/api/planos/${id}/${ativo ? "desativar" : "ativar"}`, { method: "PATCH" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Nao foi possivel alterar o plano.");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel alterar o plano.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <span className={styles.actionStack}>
      <button
        className={`${styles.button} ${ativo ? styles.buttonDanger : styles.buttonPrimary}`}
        disabled={carregando}
        onClick={alterar}
        type="button"
      >
        {carregando ? "Alterando..." : ativo ? "Desativar" : "Ativar"}
      </button>
      {erro && <span className={styles.inlineError}>{erro}</span>}
    </span>
  );
}
