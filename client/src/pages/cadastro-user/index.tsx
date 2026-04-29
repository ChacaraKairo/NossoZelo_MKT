import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Style from '@/styles/CadastroPage.module.css';

import Input from '@/components/inputs/Input';
import InputDate from '@/components/inputs/InputDate';
import Button from '@/components/btn/Button';
import Logo from '@/components/logos/OnlyLogo';

import {
  cadastrarUsuario,
  CadastroApiError,
} from '@/service/cadastroService';
import {
  mascaraCep,
  mascaraCpf,
  mascaraNumero,
  mascaraTelefone,
  mascaraUf,
} from '@/utils/masks';
import {
  ErrosCadastro,
  validarCadastroUsuario,
} from '@/validation/cadastroValidation';

import {
  FaCity,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHashtag,
  FaIdCard,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaRoad,
  FaUser,
  FaVenusMars,
} from 'react-icons/fa';

const CadastroPage = () => {
  const router = useRouter();

  const [tipo] = useState('cliente');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] =
    useState<Date | null>(null);
  const [sexo, setSexo] = useState('outro');

  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ErrosCadastro>({});

  const limparErroCampo = useCallback((...campos: string[]) => {
    setFieldErrors((errosAtuais) => {
      const novosErros = { ...errosAtuais };
      campos.forEach((campo) => {
        delete novosErros[campo];
      });
      return novosErros;
    });
  }, []);

  const erroDoCampo = (...campos: string[]) =>
    campos.map((campo) => fieldErrors[campo]).find(Boolean);

  const mapearCampoApi = (campo: string) => {
    const mapa: Record<string, string> = {
      data_nascimento: 'dataNascimento',
    };

    return mapa[campo] || campo;
  };

  useEffect(() => {
    const buscarCep = async () => {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`,
          );
          const dados = await response.json();
          if (!dados.erro) {
            setRua(dados.logradouro || '');
            setBairro(dados.bairro || '');
            setCidade(dados.localidade || '');
            setEstado(dados.uf || '');
            limparErroCampo(
              'cep',
              'rua',
              'bairro',
              'cidade',
              'estado',
              'uf',
            );
            setError(null);
          } else {
            setError('CEP não encontrado.');
          }
        } catch (err) {        }
      }
    };
    buscarCep();
  }, [cep, limparErroCampo]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const erros = validarCadastroUsuario({
      nome,
      sobrenome,
      cpf,
      telefone,
      dataNascimento,
      sexo,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      email,
      senha,
      confirmarSenha,
    });

    if (Object.keys(erros).length > 0) {
      setFieldErrors(erros);
      return;
    }

    setLoading(true);

    const dadosCadastro = {
      usuario: {
        nome: `${nome} ${sobrenome}`.trim(),
        email,
        senha,
        telefone: telefone.replace(/\D/g, ''),
        cpf: cpf.replace(/\D/g, ''),
        sexo,
        data_nascimento: dataNascimento
          ? dataNascimento.toISOString().split('T')[0]
          : null,
        cep: cep.replace(/\D/g, ''),
        endereco: `${rua}, ${numero} - ${bairro}`,
        bairro,
        cidade,
        estado,
        pais: 'Brasil',
        url_foto_perfil: '',
        tipo,
        email_confirmado: false,
      },
    };

    try {
      const resultadoCadastro = await cadastrarUsuario(dadosCadastro);
      if (fotoPerfil && resultadoCadastro.uploadToken) {
        const formData = new FormData();
        formData.append('foto', fotoPerfil);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        await fetch(`${apiUrl}/nossozelo/upload/completar-cadastro`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resultadoCadastro.uploadToken}`,
          },
          body: formData,
        });
      }
      alert('Cadastro realizado com sucesso!');
      router.push('/login-user');
    } catch (err: any) {
      if (err instanceof CadastroApiError && err.fieldErrors) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(err.fieldErrors).map(
              ([campo, mensagem]) => [
                mapearCampoApi(campo),
                mensagem,
              ],
            ),
          ),
        );
      }

      setError(err.message || 'Erro ao completar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.loginPage}>
      <aside className={Style.infoSection}>
        <div className={Style.brandWrapper}>
          <Logo />
          <h1 className={Style.brandName}>NossoZelo</h1>
        </div>
        <blockquote className={Style.welcomeText}>
          "Receber você em nossa comunidade é um privilégio. Nosso
          compromisso é cuidar bem de você e de todos aqueles que
          você ama."
        </blockquote>
      </aside>

      <main className={Style.formSection}>
        <section className={Style.formCard}>
          <form
            className={Style.form}
            onSubmit={handleSubmit}
          >
            <h2>Criar nova conta</h2>

            <Button
              variant="secondary"
              onClick={() =>
                router.push('/cadastro-prestador')
              }
            >
              Desejo ser prestador de cuidados
            </Button>

            <div className={Style.loginForm}>
              {error && (
                <div className={Style.error}>
                  <p>{error}</p>
                </div>
              )}

              <div className={Style.inputRow}>
                <div className={Style.field}>
                  <Input
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      limparErroCampo('nome');
                    }}
                    placeholder="Nome"
                    icon={<FaUser />}
                    disabled={loading}
                  />
                  {fieldErrors.nome && (
                    <span className={Style.errorText}>
                      {fieldErrors.nome}
                    </span>
                  )}
                </div>

                <div className={Style.field}>
                  <Input
                    value={sobrenome}
                    onChange={(e) => {
                      setSobrenome(e.target.value);
                      limparErroCampo('sobrenome');
                    }}
                    placeholder="Sobrenome"
                    disabled={loading}
                  />
                  {fieldErrors.sobrenome && (
                    <span className={Style.errorText}>
                      {fieldErrors.sobrenome}
                    </span>
                  )}
                </div>
              </div>

              <div className={Style.inputRow}>
                <div className={Style.field}>
                  <Input
                    value={cpf}
                    onChange={(e) => {
                      setCpf(mascaraCpf(e.target.value));
                      limparErroCampo('cpf');
                    }}
                    placeholder="CPF"
                    icon={<FaIdCard />}
                    disabled={loading}
                  />
                  {fieldErrors.cpf && (
                    <span className={Style.errorText}>
                      {fieldErrors.cpf}
                    </span>
                  )}
                </div>

                <div className={Style.field}>
                  <Input
                    value={telefone}
                    onChange={(e) => {
                      setTelefone(
                        mascaraTelefone(e.target.value),
                      );
                      limparErroCampo('telefone');
                    }}
                    placeholder="Telefone"
                    icon={<FaPhone />}
                    type="tel"
                    disabled={loading}
                  />
                  {fieldErrors.telefone && (
                    <span className={Style.errorText}>
                      {fieldErrors.telefone}
                    </span>
                  )}
                </div>
              </div>

              <div className={Style.inputRow}>
                <div className={Style.field}>
                  <InputDate
                    selectedDate={dataNascimento}
                    onChange={(date) => {
                      setDataNascimento(date);
                      limparErroCampo('dataNascimento');
                    }}
                    placeholderText="Nascimento"
                    disabled={loading}
                  />
                  {fieldErrors.dataNascimento && (
                    <span className={Style.errorText}>
                      {fieldErrors.dataNascimento}
                    </span>
                  )}
                </div>
              </div>

              <div className={Style.genderSelection}>
                <div className={Style.genderLabelWrapper}>
                  <FaVenusMars />
                  <span className={Style.genderLabel}>
                    Gênero
                  </span>
                </div>
                <div className={Style.genderOptions}>
                  <div
                    className={`${Style.genderOption} ${
                      sexo === 'masculino'
                        ? Style.genderOptionActive
                        : ''
                    }`}
                    onClick={() => {
                      setSexo('masculino');
                      limparErroCampo('sexo');
                    }}
                  >
                    Masculino
                  </div>
                  <div
                    className={`${Style.genderOption} ${
                      sexo === 'feminino'
                        ? Style.genderOptionActive
                        : ''
                    }`}
                    onClick={() => {
                      setSexo('feminino');
                      limparErroCampo('sexo');
                    }}
                  >
                    Feminino
                  </div>
                  <div
                    className={`${Style.genderOption} ${
                      sexo === 'outro'
                        ? Style.genderOptionActive
                        : ''
                    }`}
                    onClick={() => {
                      setSexo('outro');
                      limparErroCampo('sexo');
                    }}
                  >
                    Outro
                  </div>
                </div>
                {fieldErrors.sexo && (
                  <span className={Style.errorText}>
                    {fieldErrors.sexo}
                  </span>
                )}
              </div>

              <label className={Style.photoUpload}>
                <span>Foto de perfil</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={(event) =>
                    setFotoPerfil(event.target.files?.[0] || null)
                  }
                />
                <small>
                  {fotoPerfil
                    ? fotoPerfil.name
                    : 'Opcional, mas ajuda outros usuarios a reconhecerem voce.'}
                </small>
              </label>

              <div className={Style.field}>
                <Input
                  value={cep}
                  onChange={(e) => {
                    setCep(mascaraCep(e.target.value));
                    limparErroCampo('cep');
                  }}
                  placeholder="CEP"
                  icon={<FaMapMarkerAlt />}
                  disabled={loading}
                />
                {fieldErrors.cep && (
                  <span className={Style.errorText}>
                    {fieldErrors.cep}
                  </span>
                )}
              </div>

              <div className={Style.inputRow}>
                <div className={Style.fieldLarge}>
                  <Input
                    value={rua}
                    onChange={(e) => {
                      setRua(e.target.value);
                      limparErroCampo('rua');
                    }}
                    placeholder="Rua / Logradouro"
                    icon={<FaRoad />}
                    disabled={loading}
                  />
                  {fieldErrors.rua && (
                    <span className={Style.errorText}>
                      {fieldErrors.rua}
                    </span>
                  )}
                </div>

                <div className={Style.fieldSmall}>
                  <Input
                    value={numero}
                    onChange={(e) => {
                      setNumero(
                        mascaraNumero(e.target.value),
                      );
                      limparErroCampo('numero');
                    }}
                    placeholder="Nº"
                    icon={<FaHashtag />}
                    disabled={loading}
                  />
                  {fieldErrors.numero && (
                    <span className={Style.errorText}>
                      {fieldErrors.numero}
                    </span>
                  )}
                </div>
              </div>

              <div className={Style.field}>
                <Input
                  value={bairro}
                  onChange={(e) => {
                    setBairro(e.target.value);
                    limparErroCampo('bairro');
                  }}
                  placeholder="Bairro"
                  icon={<FaMapMarkerAlt />}
                  disabled={loading}
                />
                {fieldErrors.bairro && (
                  <span className={Style.errorText}>
                    {fieldErrors.bairro}
                  </span>
                )}
              </div>

              <div className={Style.inputRow}>
                <div className={Style.field}>
                  <Input
                    value={cidade}
                    onChange={(e) => {
                      setCidade(e.target.value);
                      limparErroCampo('cidade');
                    }}
                    placeholder="Cidade"
                    icon={<FaCity />}
                    disabled={loading}
                  />
                  {fieldErrors.cidade && (
                    <span className={Style.errorText}>
                      {fieldErrors.cidade}
                    </span>
                  )}
                </div>

                <div className={Style.field}>
                  <Input
                    value={estado}
                    onChange={(e) => {
                      setEstado(mascaraUf(e.target.value));
                      limparErroCampo('estado', 'uf');
                    }}
                    placeholder="UF"
                    disabled={loading}
                  />
                  {erroDoCampo('estado', 'uf') && (
                    <span className={Style.errorText}>
                      {erroDoCampo('estado', 'uf')}
                    </span>
                  )}
                </div>
              </div>

              <div className={Style.field}>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    limparErroCampo('email');
                  }}
                  placeholder="E-mail"
                  type="email"
                  icon={<FaEnvelope />}
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <span className={Style.errorText}>
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className={Style.field}>
                <Input
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    limparErroCampo('senha', 'confirmarSenha');
                  }}
                  placeholder="Senha forte"
                  type={mostrarSenha ? 'text' : 'password'}
                  icon={
                    mostrarSenha ? <FaEyeSlash /> : <FaEye />
                  }
                  iconPosition="right"
                  onIconClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                  disabled={loading}
                />
                {fieldErrors.senha && (
                  <span className={Style.errorText}>
                    {fieldErrors.senha}
                  </span>
                )}
              </div>

              <div className={Style.field}>
                <Input
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    limparErroCampo('confirmarSenha');
                  }}
                  placeholder="Confirme a senha forte"
                  type="password"
                  icon={<FaLock />}
                  iconPosition="right"
                  disabled={loading}
                />
                {fieldErrors.confirmarSenha && (
                  <span className={Style.errorText}>
                    {fieldErrors.confirmarSenha}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading
                  ? 'Cadastrando...'
                  : 'Finalizar Cadastro'}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CadastroPage;
