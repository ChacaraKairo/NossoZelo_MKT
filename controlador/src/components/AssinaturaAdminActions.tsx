"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/styles/admin.module.css";

const STATUS = [
  "pendente",
  "aguardando_confirmacao",
  "ativa",
  "atrasada",
  "bloqueada",
  "cancelada",
  "falhou",
  "expirada"
];

type AssinaturaAdminActionsProps = {
  id: number;
  statusAtual: string;
};

export function AssinaturaAdminActions({ id, statusAtual }: AssinaturaAdminActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(endpoint: string, options?: RequestInit) {
    setCarregando(true);
    setErro(null);
    setMensagem(null);

    try {
      const response = await fetch(endpoint, options);
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Nao foi possivel concluir a acao.");
      setMensagem(json.message || "Acao concluida.");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel concluir a acao.");
    } finally {
      setCarregando(false);
    }
  }

  async function alterarStatus() {
    const destrutivo = ["cancelada", "bloqueada", "falhou"].includes(status);
    const confirmado = !destrutivo || window.confirm("Confirmar alteracao administrativa de status?");

    if (!confirmado) return;

    await enviar(`/api/assinaturas/${id}/alterar-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, confirmacao: destrutivo ? true : undefined })
    });
  }

  return (
    <div className={styles.formBand}>
      <label>
        <span>Status administrativo</span>
        <select className={styles.select} value={status} onChange={(event) => setStatus(event.target.value)}>
          {STATUS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className={styles.filters}>
        <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={carregando} onClick={alterarStatus} type="button">
          Alterar status
        </button>
        <button
          className={styles.button}
          disabled={carregando}
          onClick={() => enviar(`/api/assinaturas/${id}/reprocessar`, { method: "POST" })}
          type="button"
        >
          Reprocessar status do prestador
        </button>
      </div>
      {mensagem && <span className={styles.inlineSuccess}>{mensagem}</span>}
      {erro && <span className={styles.inlineError}>{erro}</span>}
    </div>
  );
}
