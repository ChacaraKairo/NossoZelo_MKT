"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";

type Feedback = { tipo: "sucesso" | "erro"; texto: string } | null;

export function AdminCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const dados = new FormData(form);
    setLoading(true);
    setFeedback({ tipo: "sucesso", texto: "Criando administrador..." });

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dados.get("nome"),
          email: dados.get("email"),
          senha: dados.get("senha"),
          cpf: dados.get("cpf"),
          telefone: dados.get("telefone") || undefined,
          cep: dados.get("cep") || undefined
        })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setFeedback({ tipo: "erro", texto: payload?.error ?? "Nao foi possivel criar o administrador." });
        return;
      }

      form.reset();
      setFeedback({ tipo: "sucesso", texto: payload?.message ?? "Administrador criado com sucesso." });
      router.refresh();
    } catch {
      setFeedback({ tipo: "erro", texto: "Falha de conexao ao criar administrador." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.adminCreateForm} onSubmit={onSubmit}>
      <input className={styles.input} name="nome" placeholder="Nome do administrador" required />
      <input className={styles.input} name="email" placeholder="E-mail" required type="email" />
      <input className={styles.input} name="cpf" placeholder="CPF" required />
      <input className={styles.input} name="telefone" placeholder="Telefone" />
      <input className={styles.input} name="cep" placeholder="CEP" />
      <input className={styles.input} name="senha" placeholder="Senha inicial" required type="password" minLength={8} />
      <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={loading} type="submit">
        {loading ? "Criando..." : "Criar administrador"}
      </button>
      {feedback ? (
        <span
          aria-live="polite"
          className={feedback.tipo === "sucesso" ? styles.inlineSuccess : styles.inlineError}
        >
          {feedback.texto}
        </span>
      ) : null}
    </form>
  );
}
