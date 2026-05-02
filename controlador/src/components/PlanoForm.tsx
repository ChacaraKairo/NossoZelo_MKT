"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "@/styles/admin.module.css";

type PlanoFormProps = {
  modo: "novo" | "editar";
  plano?: {
    id: number;
    nome: string;
    descricao?: string | null;
    valor: number | string;
    beneficios?: string | null;
    ordem: number;
    ativo: boolean;
  };
};

export function PlanoForm({ modo, plano }: PlanoFormProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      nome: String(form.get("nome") || ""),
      descricao: String(form.get("descricao") || ""),
      valor: Number(form.get("valor") || 0),
      beneficios: String(form.get("beneficios") || ""),
      ordem: Number(form.get("ordem") || 0),
      ativo: form.get("ativo") === "on"
    };

    try {
      const response = await fetch(modo === "novo" ? "/api/planos" : `/api/planos/${plano?.id}`, {
        method: modo === "novo" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Nao foi possivel salvar o plano.");

      router.push("/planos");
      router.refresh();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel salvar o plano.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className={styles.formBand} onSubmit={salvar}>
      {erro && <div className={styles.alert}>{erro}</div>}
      <label>
        <span>Nome</span>
        <input className={styles.input} name="nome" defaultValue={plano?.nome || ""} required />
      </label>
      <label>
        <span>Descricao</span>
        <textarea className={styles.textarea} name="descricao" defaultValue={plano?.descricao || ""} />
      </label>
      <label>
        <span>Valor mensal</span>
        <input
          className={styles.input}
          name="valor"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={Number(plano?.valor || 0)}
          required
        />
      </label>
      <label>
        <span>Beneficios</span>
        <textarea className={styles.textarea} name="beneficios" defaultValue={plano?.beneficios || ""} />
      </label>
      <label>
        <span>Ordem</span>
        <input className={styles.input} name="ordem" type="number" min="0" defaultValue={plano?.ordem ?? 0} />
      </label>
      <label className={styles.checkboxField}>
        <input name="ativo" type="checkbox" defaultChecked={plano?.ativo ?? true} />
        <span>Plano ativo</span>
      </label>
      <div className={styles.filters}>
        <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={salvando} type="submit">
          {salvando ? "Salvando..." : "Salvar plano"}
        </button>
        <button className={styles.button} type="button" onClick={() => router.push("/planos")}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
