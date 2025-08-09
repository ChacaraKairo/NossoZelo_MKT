import React, { useState } from 'react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';
import Style from '@/styles/LoginPage.module.css';
import Link from 'next/link';

// --- Importações Corrigidas ---
// Assumindo que seus componentes customizados estão nos caminhos corretos
import InputEmail from '@/components/inputs/InputEmail';
import InputPassword from '@/components/inputs/InputPassword';
import Logo from '@/components/logos/LogoNoLink';
// Importando o novo botão reutilizável
import Button from '@/components/btn/Button';

const LoginPage = () => {
  // Estado para controlar os valores dos inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Função para lidar com o envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Aqui você adicionaria a lógica de login
    console.log({ email, password });
  };

  // Funções para os cliques dos botões (exemplo)
  const handleCadastroClick = () => {
    console.log('Navegar para a página de cadastro...');
    // Ex: window.location.href = '/cadastro';
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

            <div className={Style.loginForm}>
              <InputEmail
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputPassword
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <div className={Style.options}>
                <label className={Style.checkboxContainer}>
                  <input type="checkbox" />
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
              <Button type="submit" variant="primary">
                Entrar
              </Button>
            </div>

            <div className={Style.createAccount}>
              <p>Não tem uma conta?</p>
              {/* --- Uso do Botão Reutilizável com a variação secundária --- */}
              <Link href="/cadastro/nossozelo">
                <Button
                  variant="secondary"
                  onClick={handleCadastroClick}
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
