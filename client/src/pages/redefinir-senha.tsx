import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Style from '@/styles/LoginPage.module.css';
import InputPassword from '@/components/inputs/InputPassword';
import Button from '@/components/btn/Button';
import { loginService } from '@/service/Login';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (senha !== confirmar) {
      setError('As senhas nao conferem.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginService.redefinirSenha(token, senha);
      router.push('/login-user');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.loginPage}>
      <main className={Style.main}>
        <section className={Style.formSection}>
          <form className={Style.form} onSubmit={handleSubmit}>
            <h2>Nova senha</h2>
            {error && <p className={Style.error}>{error}</p>}
            <div className={Style.loginForm}>
              <InputPassword value={senha} onChange={(e) => setSenha(e.target.value)} disabled={loading} />
              <InputPassword value={confirmar} onChange={(e) => setConfirmar(e.target.value)} disabled={loading} />
              <Button type="submit" variant="primary" disabled={loading || !token}>
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
