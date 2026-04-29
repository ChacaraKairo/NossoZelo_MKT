import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { recuperacaoSenhaService } from '@/service/recuperacaoSenhaService';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/RecuperacaoSenhaPage.module.css';

const MENSAGEM_GENERICA =
  'Se este e-mail estiver cadastrado, enviaremos instrucoes para redefinir sua senha.';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const resposta =
        await recuperacaoSenhaService.solicitarRecuperacao(email);
      setMessage(resposta.message || MENSAGEM_GENERICA);
    } catch (err) {
      setError(extrairMensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Recuperar senha</h1>
            <p className={styles.subtitle}>
              Informe seu e-mail e enviaremos as instrucoes se houver uma conta
              cadastrada.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.success}>{message}</div>}

            <label className={styles.field}>
              <span className={styles.label}>E-mail</span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </label>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Enviando...' : 'Enviar instrucoes'}
              </button>
              <Link href="/login-user" className={styles.secondaryLink}>
                Voltar ao login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
