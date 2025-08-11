import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import Style from '@/styles/LoginPage.module.css';

// --- Importações Corrigidas ---
// Assumindo que seus componentes customizados estão nos caminhos corretos
import InputEmail from '@/components/inputs/InputEmail';
import InputPassword from '@/components/inputs/InputPassword';
import Logo from '@/components/logos/OnlyLogo'; // Assumindo que o caminho está correto
// Importando o novo botão reutilizável
import Button from '@/components/btn/Button';
import { loginService } from '@/service/Login';

const LoginPage = () => {
  const router = useRouter();
  // Estado para controlar os valores dos inputs, loading e erros
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para lidar com o envio do formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginService.login({
        identificador,
        senha,
      });

      // O token já foi salvo nos cookies pelo serviço.
      // Apenas redirecionamos o usuário para a página principal.
      console.log('Login bem-sucedido:', response);
      router.push('/prestadores'); // Ajuste a rota de destino se necessário
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
                  <input
                    type="checkbox"
                    disabled={loading}
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
              <Link href="/cadastro/nossozelo" passHref>
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
