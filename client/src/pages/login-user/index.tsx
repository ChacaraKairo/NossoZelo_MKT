import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import Style from '@/styles/LoginPage.module.css';

// --- Importações Corrigidas ---
import InputEmail from '@/components/inputs/InputEmail';
import InputPassword from '@/components/inputs/InputPassword';
import Logo from '@/components/logos/OnlyLogo';
import Button from '@/components/btn/Button';
import { loginService } from '@/service/Login';
import logger from '@/utils/logger';

const CHAVE_IDENTIFICADOR_LEMBRADO =
  'nossozelo_identificador_lembrado';
const CHAVE_LEMBRAR_ME_LEGADA = 'nossozelo_lembrar_me';
const FACEBOOK_LOGIN_ATIVO =
  process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true';

const LoginPage = () => {
  const router = useRouter();

  // Estados para controlar os valores dos inputs, loading e erros
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<
    'google' | 'facebook' | null
  >(null);

  const [lembrarMe, setLembrarMe] = useState(false);

  const iniciarSocial = (provider: 'google' | 'facebook') => {
    setError(null);
    setSocialLoading(provider);
    loginService.iniciarLoginSocial(provider);
  };

  useEffect(() => {
    localStorage.removeItem(CHAVE_LEMBRAR_ME_LEGADA);

    const identificadorSalvo = localStorage.getItem(
      CHAVE_IDENTIFICADOR_LEMBRADO,
    );

    if (identificadorSalvo) {
      try {
        const { identificador } = JSON.parse(identificadorSalvo);
        if (identificador) {
          setIdentificador(identificador);
          setLembrarMe(true);
        }
      } catch (e) {
        localStorage.removeItem(CHAVE_IDENTIFICADOR_LEMBRADO);
        logger.warn('LoginPage', 'Identificador salvo inválido removido', {
          mensagem: e instanceof Error ? e.message : 'Erro desconhecido',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof router.query.erroSocial === 'string') {
      setError(router.query.erroSocial);
    }
  }, [router.query.erroSocial]);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!identificador.trim() || !senha.trim()) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await loginService.login({
        identificador: identificador, // Mandando o nome exato que o Backend quer
        senha,
      });

      logger.info('LoginPage', 'Login concluído com sucesso');

      if (lembrarMe) {
        localStorage.setItem(
          CHAVE_IDENTIFICADOR_LEMBRADO,
          JSON.stringify({
            identificador: identificador.trim(),
          }),
        );
      } else {
        localStorage.removeItem(CHAVE_IDENTIFICADOR_LEMBRADO);
      }

      setLoading(false);
      if (
        response.onboardingStatus?.isPrestador &&
        response.onboardingStatus.etapaAtual !== 'ativo'
      ) {
        router.push('/onboarding/prestador');
        return;
      }
      router.push(response.user?.tipo === 'admin' ? '/dashboard' : '/prestadores');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro inesperado.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={Style.loginPage}>
      <main className={Style.main}>
        {/* Seção da Esquerda com Logo e Mensagem */}
        <div className={Style.infoSection}>
          <nav className={Style.nav}>
            <div className={Style.logo}>
              <Logo />
              <h1 className={Style.title}>NossoZelo</h1>
            </div>
            <div className={Style.text}>
              Assim como você, cuidamos bem de quem amamos!
            </div>
          </nav>
        </div>

        {/* Seção da Direita com o Formulário */}
        <section className={Style.formSection}>
          <form
            className={Style.form}
            onSubmit={handleSubmit}
          >
            <h2>Acessar conta</h2>

            <div className={Style.loginSocial}>
              <button
                type="button"
                className={`${Style.socialButton} ${Style.google}`}
                onClick={() => iniciarSocial('google')}
                disabled={loading || Boolean(socialLoading)}
              >
                <FaGoogle />{' '}
                <span>
                  {socialLoading === 'google'
                    ? 'Abrindo Google...'
                    : 'Entrar com Google'}
                </span>
              </button>
              {FACEBOOK_LOGIN_ATIVO && (
                <button
                  type="button"
                  className={`${Style.socialButton} ${Style.facebook}`}
                  onClick={() => iniciarSocial('facebook')}
                  disabled={loading || Boolean(socialLoading)}
                >
                  <FaFacebookF />{' '}
                  <span>
                    {socialLoading === 'facebook'
                      ? 'Abrindo Facebook...'
                      : 'Entrar com Facebook'}
                  </span>
                </button>
              )}
            </div>

            <div className={Style.divider}>ou</div>

            {error && (
              <p className={Style.error}>{error}</p>
            )}

            <div className={Style.loginForm}>
              <InputEmail
                value={identificador}
                onChange={(e) =>
                  setIdentificador(e.target.value)
                }
                disabled={loading}
              />
              <InputPassword
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={loading}
              />

              <div className={Style.options}>
                <label className={Style.checkboxContainer}>
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={lembrarMe}
                    onChange={(e) =>
                      setLembrarMe(e.target.checked)
                    }
                  />
                  Lembrar meu e-mail
                </label>
                <Link
                  href="/recuperar-senha"
                  className={Style.forgotPasswordLink}
                >
                  Esqueci minha senha
                </Link>
              </div>

              {/* --- Uso do Botão Reutilizável --- */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>

            <div className={Style.createAccount}>
              <p>Não tem uma conta?</p>
              {/* --- Uso do Botão Reutilizável com a variação secundária --- */}
              <Link href="/cadastro-user" passHref>
                <Button
                  variant="secondary"
                  disabled={loading}
                >
                  Cadastre-se
                </Button>
              </Link>
            </div>

            <footer className={Style.footer}>
              <div className={Style.copyright}>
                © 2024 NossoZelo. Todos os direitos
                reservados.
              </div>
              <div className={Style.terms}>
                <Link
                  href="/termos-de-uso/nossozelo"
                  className={Style.link}
                >
                  Termos de Uso
                </Link>
                <span>&nbsp;•&nbsp;</span>
                <Link
                  href="/politica-de-privacidade/nossozelo"
                  className={Style.link}
                >
                  Política de Privacidade
                </Link>
              </div>
            </footer>
          </form>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
