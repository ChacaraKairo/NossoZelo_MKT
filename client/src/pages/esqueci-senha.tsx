import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Style from '@/styles/LoginPage.module.css';
import InputEmail from '@/components/inputs/InputEmail';
import Button from '@/components/btn/Button';
import { loginService } from '@/service/Login';

export default function EsqueciSenhaPage() {
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
      await loginService.solicitarRecuperacaoSenha(email);
      setMessage('Enviamos um link de redefinicao para seu e-mail.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.loginPage}>
      <main className={Style.main}>
        <section className={Style.formSection}>
          <form className={Style.form} onSubmit={handleSubmit}>
            <h2>Recuperar senha</h2>
            {error && <p className={Style.error}>{error}</p>}
            {message && <p className={Style.success}>{message}</p>}
            <div className={Style.loginForm}>
              <InputEmail value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </Button>
              <Link href="/login-user" className={Style.forgotPasswordLink}>Voltar ao login</Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
