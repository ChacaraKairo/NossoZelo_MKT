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

const LoginPage = () => {
  const router = useRouter();

  // Estados para controlar os valores dos inputs, loading e erros
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 NOVO: Estado para controlar o checkbox "Lembrar-me"
  const [lembrarMe, setLembrarMe] = useState(false);

  // 🔥 NOVO: Efeito que roda assim que a página carrega para preencher os campos
  useEffect(() => {
    const credenciaisSalvas = localStorage.getItem(
      'nossozelo_lembrar_me',
    );
    if (credenciaisSalvas) {
      try {
        const { emailSalvo, senhaSalva } = JSON.parse(
          credenciaisSalvas,
        );
        if (emailSalvo) setIdentificador(emailSalvo);
        if (senhaSalva) setSenha(senhaSalva);
        setLembrarMe(true); // Deixa o checkbox marcado automaticamente
      } catch (e) {
        console.error('Erro ao ler credenciais salvas', e);
      }
    }
  }, []);

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

      console.log('Login bem-sucedido:', response);

      // 🔥 NOVO: Se o usuário marcou "Lembrar-me", salvamos no localStorage.
      // Se ele desmarcou, nós apagamos o que estava lá.
      if (lembrarMe) {
        localStorage.setItem(
          'nossozelo_lembrar_me',
          JSON.stringify({
            emailSalvo: identificador,
            senhaSalva: senha,
          }),
        );
      } else {
        localStorage.removeItem('nossozelo_lembrar_me');
      }

      setLoading(false);
      router.push('/prestadores');
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
              >
                <FaGoogle /> <span>Entrar com Google</span>
              </button>
              <button
                type="button"
                className={`${Style.socialButton} ${Style.facebook}`}
              >
                <FaFacebookF />
              </button>
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
                  {/* 🔥 NOVO: Conectando o checkbox ao nosso estado lembrarMe */}
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={lembrarMe}
                    onChange={(e) =>
                      setLembrarMe(e.target.checked)
                    }
                  />
                  Lembrar-me
                </label>
                <a
                  href="#"
                  className={Style.forgotPasswordLink}
                >
                  Esqueci minha senha
                </a>
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
