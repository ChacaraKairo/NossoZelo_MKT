import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { recuperacaoSenhaService } from '@/service/recuperacaoSenhaService';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/RecuperacaoSenhaPage.module.css';

function validarSenha(senha: string) {
  if (
    senha.length < 8 ||
    senha.length > 72 ||
    !/[a-z]/.test(senha) ||
    !/[A-Z]/.test(senha) ||
    !/\d/.test(senha) ||
    !/[^A-Za-z0-9]/.test(senha)
  ) {
    return 'A senha deve ter 8 a 72 caracteres, com maiuscula, minuscula, numero e caractere especial.';
  }

  return null;
}

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  );
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [validando, setValidando] = useState(true);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      setError('Token de recuperacao ausente.');
      setValidando(false);
      return;
    }

    recuperacaoSenhaService
      .validarToken(token)
      .then(() => setError(null))
      .catch((err) => setError(extrairMensagemErro(err)))
      .finally(() => setValidando(false));
  }, [router.isReady, token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSucesso(null);

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      setError(erroSenha);
      return;
    }

    if (senha !== confirmar) {
      setError('As senhas nao conferem.');
      return;
    }

    try {
      setLoading(true);
      const resposta = await recuperacaoSenhaService.redefinirSenha(
        token,
        senha,
      );
      setSucesso(resposta.message || 'Senha redefinida com sucesso.');
      setSenha('');
      setConfirmar('');
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
            <h1 className={styles.title}>Nova senha</h1>
            <p className={styles.subtitle}>
              Crie uma senha forte para voltar a acessar sua conta.
            </p>
          </div>

          {validando ? (
            <p className={styles.hint}>Validando link de recuperacao...</p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              {error && <div className={styles.error}>{error}</div>}
              {sucesso && <div className={styles.success}>{sucesso}</div>}

              {!sucesso && (
                <>
                  <label className={styles.field}>
                    <span className={styles.label}>Nova senha</span>
                    <input
                      className={styles.input}
                      type="password"
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      disabled={loading || Boolean(error && !senha)}
                      autoComplete="new-password"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Confirmar nova senha</span>
                    <input
                      className={styles.input}
                      type="password"
                      value={confirmar}
                      onChange={(event) => setConfirmar(event.target.value)}
                      disabled={loading || Boolean(error && !senha)}
                      autoComplete="new-password"
                    />
                  </label>

                  <p className={styles.hint}>
                    Use 8 a 72 caracteres, com letra maiuscula, minuscula,
                    numero e caractere especial.
                  </p>
                </>
              )}

              <div className={styles.actions}>
                {!sucesso && (
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={loading || !token || Boolean(error && !senha)}
                  >
                    {loading ? 'Salvando...' : 'Redefinir senha'}
                  </button>
                )}
                <Link href="/login-user" className={styles.secondaryLink}>
                  Ir para login
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
