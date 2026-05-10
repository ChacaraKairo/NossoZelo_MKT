import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import Button from '@/components/btn/Button';
import { getNossoZeloApiUrl } from '@/config/api';
import { loginService } from '@/service/Login';
import {
  mascaraCep,
  mascaraCpf,
  mascaraNumero,
  mascaraTelefone,
  mascaraUf,
} from '@/utils/masks';
import styles from '@/styles/CadastroSocialPage.module.css';

type TipoConta = 'cliente' | 'cuidador' | 'enfermeiro' | 'acompanhante';

interface SocialPayload {
  purpose?: string;
  provider?: 'google' | 'facebook';
  email?: string;
  nome?: string;
  url_foto_perfil?: string;
  exp?: number;
}

const tiposConta: Array<{ value: TipoConta; label: string }> = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'cuidador', label: 'Cuidador' },
  { value: 'enfermeiro', label: 'Enfermeiro' },
  { value: 'acompanhante', label: 'Acompanhante' },
];

function decodificarToken(token?: string): SocialPayload | null {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );

    return JSON.parse(json) as SocialPayload;
  } catch {
    return null;
  }
}

function limparDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

function destinoPorTipo(tipo: string) {
  return tipo === 'cliente' ? '/prestadores' : '/onboarding/prestador';
}

export default function CadastroSocialPage() {
  const router = useRouter();
  const socialToken = '';

  const [tipo, setTipo] = useState<TipoConta>('cliente');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [sexo, setSexo] = useState('outro');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [bio, setBio] = useState('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [disponibilidade, setDisponibilidade] = useState('');
  const [especialidades, setEspecialidades] = useState('');
  const [coren, setCoren] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dadosSociais, setDadosSociais] = useState<SocialPayload | null>(null);
  const [carregandoCadastroSocial, setCarregandoCadastroSocial] = useState(true);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const tokenInvalido =
    router.isReady &&
    !carregandoCadastroSocial &&
    (!dadosSociais ||
      dadosSociais.purpose !== 'social_signup' ||
      !dadosSociais.email);

  const isPrestador = tipo !== 'cliente';

  useEffect(() => {
    if (!router.isReady) return;

    const tokenLegado =
      typeof router.query.token === 'string' ? router.query.token : '';
    if (tokenLegado) {
      setDadosSociais(decodificarToken(tokenLegado));
      setCarregandoCadastroSocial(false);
      return;
    }

    fetch(`${getNossoZeloApiUrl()}/login/social/cadastro-pendente`, {
      credentials: 'include',
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Cadastro social pendente invalido.');
        setDadosSociais({ ...data, purpose: 'social_signup' });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Cadastro social pendente invalido.'),
      )
      .finally(() => setCarregandoCadastroSocial(false));
  }, [router.isReady, router.query.token]);

  useEffect(() => {
    if (dadosSociais?.nome) {
      setNome((atual) => atual || dadosSociais.nome || '');
    }
  }, [dadosSociais?.nome]);

  async function buscarCep(valor: string) {
    const cepFormatado = mascaraCep(valor);
    const cepLimpo = limparDigitos(cepFormatado);
    setCep(cepFormatado);

    if (cepLimpo.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();

      if (!dados.erro) {
        setRua(dados.logradouro || '');
        setBairro(dados.bairro || '');
        setCidade(dados.localidade || '');
        setEstado(dados.uf || '');
      }
    } finally {
      setLoadingCep(false);
    }
  }

  function validarFormulario() {
    const obrigatorios = [
      ['nome', nome],
      ['telefone', telefone],
      ['cpf', cpf],
      ['data de nascimento', dataNascimento],
      ['CEP', cep],
      ['endereco', rua],
      ['numero', numero],
      ['bairro', bairro],
      ['cidade', cidade],
      ['estado', estado],
    ] as const;

    for (const [campo, valor] of obrigatorios) {
      if (!String(valor || '').trim()) {
        return `Preencha o campo ${campo}.`;
      }
    }

    if (limparDigitos(cpf).length !== 11) return 'Informe um CPF valido.';
    if (limparDigitos(telefone).length < 10) return 'Informe um telefone valido.';
    if (limparDigitos(cep).length !== 8) return 'Informe um CEP valido.';

    if (isPrestador) {
      if (!bio.trim()) return 'Informe uma bio profissional.';
      if (!disponibilidade.trim()) return 'Informe sua disponibilidade.';
      if (!especialidades.trim()) return 'Informe suas especialidades.';
    }

    if (tipo === 'enfermeiro' && !coren.trim()) {
      return 'Informe o COREN.';
    }

    if (!aceitouTermos) {
      return 'Voce precisa aceitar os Termos de Uso e a Politica de Privacidade para criar sua conta.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setError(erroValidacao);
      return;
    }

    const endereco = `${rua.trim()}, ${numero.trim()} - ${bairro.trim()}`;
    const perfilProfissional = {
      bio,
      anos_experiencia: anosExperiencia,
      valor_hora: valorHora,
      valor_diaria: valorDiaria,
      disponibilidade,
      especialidades,
      coren,
    };

    try {
      setLoading(true);
      const resposta = await loginService.completarCadastroSocial({
        socialToken,
        nome,
        telefone: limparDigitos(telefone),
        cpf: limparDigitos(cpf),
        sexo,
        data_nascimento: dataNascimento,
        cep: limparDigitos(cep),
        endereco,
        bairro,
        cidade,
        estado,
        tipo,
        aceitouTermos,
        url_foto_perfil: dadosSociais?.url_foto_perfil || '',
        ...(isPrestador ? { [tipo]: perfilProfissional } : {}),
      });

      router.replace(destinoPorTipo(resposta.user?.tipo || tipo));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nao foi possivel concluir o cadastro social.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (carregandoCadastroSocial) {
    return <main className={styles.page}><section className={styles.card}>Carregando cadastro social...</section></main>;
  }

  if (tokenInvalido) {
    return (
      <main className={styles.page}>
        <section className={styles.errorCard}>
          <h1>Link de cadastro invalido</h1>
          <p>
            Nao conseguimos confirmar este link. Volte para o login e tente
            entrar novamente com sua conta social.
          </p>
          <Link className={styles.backLink} href="/login-user">
            Voltar ao login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>Cadastro com rede social</span>
            <h1>Complete sua conta NossoZelo</h1>
            <p>
              Seu e-mail ja veio do provedor. Complete apenas os dados
              necessarios para ativar sua conta.
            </p>
          </div>

          <div className={styles.providerBox}>
            {dadosSociais?.url_foto_perfil ? (
              <img
                className={styles.avatar}
                src={dadosSociais.url_foto_perfil}
                alt=""
              />
            ) : (
              <div className={styles.avatarFallback}>
                {dadosSociais?.provider === 'facebook' ? <FaFacebookF /> : <FaGoogle />}
              </div>
            )}
            <strong>{dadosSociais?.provider === 'facebook' ? 'Facebook' : 'Google'}</strong>
            <span>{dadosSociais?.email}</span>
          </div>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.section}>
            <legend>Tipo de conta</legend>
            <div className={styles.typeGrid}>
              {tiposConta.map((opcao) => (
                <label
                  key={opcao.value}
                  className={`${styles.typeOption} ${
                    tipo === opcao.value ? styles.typeOptionActive : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={opcao.value}
                    checked={tipo === opcao.value}
                    onChange={() => setTipo(opcao.value)}
                    disabled={loading}
                  />
                  {opcao.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Dados pessoais</legend>
            <div className={styles.grid}>
              <label className={styles.field}>
                Nome
                <input value={nome} onChange={(e) => setNome(e.target.value)} disabled={loading} />
              </label>
              <label className={styles.field}>
                E-mail
                <input value={dadosSociais?.email || ''} disabled />
              </label>
              <label className={styles.field}>
                CPF
                <input value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} disabled={loading} />
              </label>
              <label className={styles.field}>
                Telefone
                <input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} disabled={loading} />
              </label>
              <label className={styles.field}>
                Data de nascimento
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={loading} />
              </label>
              <label className={styles.field}>
                Sexo
                <select value={sexo} onChange={(e) => setSexo(e.target.value)} disabled={loading}>
                  <option value="outro">Outro</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Endereco</legend>
            <div className={styles.grid}>
              <label className={styles.field}>
                CEP
                <input value={cep} onChange={(e) => buscarCep(e.target.value)} disabled={loading} />
                {loadingCep && <small>Buscando endereco...</small>}
              </label>
              <label className={styles.field}>
                Rua / logradouro
                <input value={rua} onChange={(e) => setRua(e.target.value)} disabled={loading} />
              </label>
              <label className={styles.field}>
                Numero
                <input value={numero} onChange={(e) => setNumero(mascaraNumero(e.target.value))} disabled={loading} />
              </label>
              <label className={styles.field}>
                Bairro
                <input value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={loading} />
              </label>
              <label className={styles.field}>
                Cidade
                <input value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={loading} />
              </label>
              <label className={styles.field}>
                Estado
                <input value={estado} onChange={(e) => setEstado(mascaraUf(e.target.value))} disabled={loading} />
              </label>
            </div>
          </fieldset>

          {isPrestador && (
            <fieldset className={styles.section}>
              <legend>Dados profissionais</legend>
              <div className={styles.grid}>
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  Bio profissional
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} rows={4} />
                </label>
                <label className={styles.field}>
                  Anos de experiencia
                  <input inputMode="numeric" value={anosExperiencia} onChange={(e) => setAnosExperiencia(mascaraNumero(e.target.value))} disabled={loading} />
                </label>
                <label className={styles.field}>
                  Valor hora
                  <input inputMode="decimal" value={valorHora} onChange={(e) => setValorHora(e.target.value.replace(/[^\d.,]/g, ''))} disabled={loading} />
                </label>
                <label className={styles.field}>
                  Valor diaria
                  <input inputMode="decimal" value={valorDiaria} onChange={(e) => setValorDiaria(e.target.value.replace(/[^\d.,]/g, ''))} disabled={loading} />
                </label>
                <label className={styles.field}>
                  Disponibilidade
                  <input value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)} disabled={loading} />
                </label>
                <label className={`${styles.field} ${styles.fieldWide}`}>
                  Especialidades
                  <input value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} disabled={loading} />
                </label>
                {tipo === 'enfermeiro' && (
                  <label className={styles.field}>
                    COREN
                    <input value={coren} onChange={(e) => setCoren(e.target.value)} disabled={loading} />
                  </label>
                )}
              </div>
            </fieldset>
          )}

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(event) => setAceitouTermos(event.target.checked)}
              disabled={loading}
            />
            <span>
              Li e aceito os{' '}
              <Link href="/termos-de-uso">Termos de Uso</Link> e a{' '}
              <Link href="/politica-de-privacidade/nossozelo">
                Politica de Privacidade
              </Link>
              .
            </span>
          </label>

          <footer className={styles.actions}>
            <Link className={styles.secondaryLink} href="/login-user">
              Cancelar
            </Link>
            <Button type="submit" variant="primary" disabled={loading || tokenInvalido}>
              {loading ? 'Finalizando...' : 'Finalizar cadastro'}
            </Button>
          </footer>
        </form>
      </section>
    </main>
  );
}
