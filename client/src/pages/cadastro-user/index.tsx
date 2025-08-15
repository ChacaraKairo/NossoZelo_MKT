// client/src/pages/cadastro/index.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Importado para redirecionar após o sucesso
import Style from '@/styles/CadastroPage.module.css';

// --- Nossos componentes reutilizáveis ---
import Input from '@/components/inputs/Input';
import InputDate from '@/components/inputs/InputDate';
import Button from '@/components/btn/Button';
import Logo from '@/components/logos/OnlyLogo';

// --- IMPORTAÇÃO DO SCRIPT DA API ---
import { cadastrarUsuario } from '@/service/cadastroService';

// --- Ícones para a UI ---
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaCity,
  FaRoad,
  FaVenusMars,
} from 'react-icons/fa';

const CadastroPage = () => {
  const router = useRouter(); // Hook do Next.js para navegação

  // --- Estados do formulário (sem alterações) ---
  const [tipo, setTipo] = useState('cliente');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] =
    useState<Date | null>(null);
  const [sexo, setSexo] = useState('outro');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // --- NOVOS ESTADOS PARA GESTÃO DA CHAMADA À API ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FUNÇÃO HANDLESUBMIT AGORA É ASYNC E CHAMA A API ---
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Limpa erros de tentativas anteriores

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem!');
      return;
    }

    setLoading(true); // Ativa o estado de loading

    const dadosCadastro = {
      usuario: {
        nome: `${nome} ${sobrenome}`.trim(),
        email: email,
        senha: senha,
        telefone: telefone,
        cpf: cpf,
        sexo: sexo,
        data_nascimento: dataNascimento
          ? dataNascimento.toISOString().split('T')[0]
          : null,
        cep: cep,
        endereco: endereco,
        cidade: cidade,
        estado: estado,
        pais: 'Brasil',
        url_foto_perfil: '',
        tipo: tipo,
        email_confirmado: false,
      },
    };

    try {
      // A chamada à API acontece aqui!
      const respostaDaApi = await cadastrarUsuario(
        dadosCadastro,
      );
      console.log(
        'Cadastro realizado com sucesso:',
        respostaDaApi,
      );
      alert(
        'Cadastro realizado com sucesso! Você será redirecionado para o login.',
      );

      // Redireciona para a página de login após o sucesso
      router.push('/login-user');
    } catch (err: any) {
      // Se o script da API lançar um erro, ele será capturado aqui
      console.error('Erro ao tentar cadastrar:', err);
      setError(
        err.message ||
          'Não foi possível completar o cadastro. Por favor, tente novamente.',
      );
    } finally {
      // Este bloco executa sempre, seja em caso de sucesso ou erro
      setLoading(false); // Desativa o estado de loading
    }
  };

  return (
    <div className={Style.loginPage}>
      <header className={Style.header}>
        <div className={Style.headerbar}>
          {' '}
          <div className={Style.logoWrapper}>
            <Logo />
          </div>
        </div>
      </header>
      <main className={Style.main}>
        {/* --- Formulário com todos os campos do JSON --- */}
        <section className={Style.formSection}>
          <form
            className={Style.form}
            onSubmit={handleSubmit}
          >
            <h2>Criar nova conta</h2>

            <div className={Style.loginForm}>
              {/* ÁREA PARA EXIBIR A MENSAGEM DE ERRO, APARECE SE 'error' NÃO FOR NULO */}
              {error && (
                <p className={Style.error}>{error}</p>
              )}

              <div className={Style.inputRow}>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome"
                  icon={<FaUser />}
                  disabled={loading} // <-- ALTERAÇÃO
                />
                <Input
                  value={sobrenome}
                  onChange={(e) =>
                    setSobrenome(e.target.value)
                  }
                  placeholder="Sobrenome"
                  disabled={loading} // <-- ALTERAÇÃO
                />
              </div>

              <div className={Style.inputRow}>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="CPF"
                  icon={<FaIdCard />}
                  disabled={loading} // <-- ALTERAÇÃO
                />
                <Input
                  value={telefone}
                  onChange={(e) =>
                    setTelefone(e.target.value)
                  }
                  placeholder="Telefone"
                  icon={<FaPhone />}
                  type="tel"
                  disabled={loading} // <-- ALTERAÇÃO
                />
              </div>

              <div className={Style.inputRow}>
                <InputDate
                  selectedDate={dataNascimento}
                  onChange={(date) =>
                    setDataNascimento(date)
                  }
                  placeholderText="Data de Nascimento"
                  disabled={loading} // <-- ALTERAÇÃO
                />
                {/* Campo de Sexo como Dropdown */}
                <div className={Style.inputContainer}>
                  <span
                    className={`${Style.icon} ${Style.left}`}
                  >
                    <FaVenusMars />
                  </span>
                  <select
                    value={sexo}
                    onChange={(e) =>
                      setSexo(e.target.value)
                    }
                    className={`${Style.inputField} ${Style.withIconLeft}`}
                    disabled={loading} // <-- ALTERAÇÃO
                  >
                    <option value="outro">
                      Prefiro não dizer
                    </option>
                    <option value="feminino">
                      Feminino
                    </option>
                    <option value="masculino">
                      Masculino
                    </option>
                  </select>
                </div>
              </div>

              <Input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="CEP"
                icon={<FaMapMarkerAlt />}
                disabled={loading} // <-- ALTERAÇÃO
              />
              <Input
                value={endereco}
                onChange={(e) =>
                  setEndereco(e.target.value)
                }
                placeholder="Endereço (Rua, Nº, Complemento)"
                icon={<FaRoad />}
                disabled={loading} // <-- ALTERAÇÃO
              />

              <div className={Style.inputRow}>
                <Input
                  value={cidade}
                  onChange={(e) =>
                    setCidade(e.target.value)
                  }
                  placeholder="Cidade"
                  icon={<FaCity />}
                  disabled={loading} // <-- ALTERAÇÃO
                />
                <Input
                  value={estado}
                  onChange={(e) =>
                    setEstado(e.target.value)
                  }
                  placeholder="Estado (UF)"
                  disabled={loading} // <-- ALTERAÇÃO
                />
              </div>

              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                type="email"
                icon={<FaEnvelope />}
                disabled={loading} // <-- ALTERAÇÃO
              />

              <Input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                type={mostrarSenha ? 'text' : 'password'}
                icon={
                  mostrarSenha ? <FaEyeSlash /> : <FaEye />
                }
                iconPosition="right"
                onIconClick={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                disabled={loading} // <-- ALTERAÇÃO
              />
              <Input
                value={confirmarSenha}
                onChange={(e) =>
                  setConfirmarSenha(e.target.value)
                }
                placeholder="Confirme a senha"
                type="password"
                icon={<FaLock />}
                iconPosition="right"
                disabled={loading} // <-- ALTERAÇÃO
              />

              {/* BOTÃO AGORA REAGE AO ESTADO DE 'loading' */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>

            <div className={Style.createAccount}>
              <p>
                Já tem uma conta?{' '}
                <Link
                  href="/login-user"
                  className={Style.link}
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CadastroPage;
