"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "@/styles/admin.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login: form.get("login"),
        senha: form.get("senha")
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setErro(data?.error ?? "Nao foi possivel entrar.");
      setEnviando(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <ShieldCheck size={34} color="#176b87" />
        <h1>Controlador NossoZelo</h1>
        <p>Entre com uma conta administrativa para acessar o painel interno.</p>

        <form className={styles.form} onSubmit={enviar}>
          <input className={styles.input} name="login" placeholder="E-mail ou CPF" required />
          <input className={styles.input} name="senha" placeholder="Senha" required type="password" />
          {erro ? <div className={styles.alert}>{erro}</div> : null}
          <button className={`${styles.button} ${styles.buttonPrimary}`} disabled={enviando} type="submit">
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
