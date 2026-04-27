import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Style from '@/styles/CadastroPage.module.css';
import Input from '@/components/inputs/Input';
import InputDate from '@/components/inputs/InputDate';
import Button from '@/components/btn/Button';
import {
  mascaraCep,
  mascaraCpf,
  mascaraNumero,
  mascaraTelefone,
  mascaraUf,
} from '@/utils/masks';
import { loginService } from '@/service/Login';
import {
  FaCity,
  FaHashtag,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaRoad,
  FaUser,
} from 'react-icons/fa';

function decodificarToken(token?: string) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export default function CadastroSocialPage() {
  const router = useRouter();
  const socialToken =
    typeof router.query.token === 'string' ? router.query.token : '';
  const dadosSociais = useMemo(
    () => decodificarToken(socialToken),
    [socialToken],
  );
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nomeInicial = nome || dadosSociais?.nome || '';

  const buscarCep = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, '');
    setCep(mascaraCep(valor));
    if (cepLimpo.length !== 8) return;

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await response.json();
    if (!dados.erro) {
      setRua(dados.logradouro || '');
      setBairro(dados.bairro || '');
      setCidade(dados.localidade || '');
      setEstado(dados.uf || '');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginService.completarCadastroSocial({
        socialToken,
        nome: nomeInicial,
        cpf: cpf.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        data_nascimento: dataNascimento
          ? dataNascimento.toISOString().split('T')[0]
          : null,
        cep: cep.replace(/\D/g, ''),
        endereco: `${rua}, ${numero} - ${bairro}`,
        bairro,
        cidade,
        estado,
        tipo: 'cliente',
      });
      router.push('/prestadores');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no cadastro social.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.loginPage}>
      <main className={Style.formSection}>
        <section className={Style.formCard}>
          <form className={Style.form} onSubmit={handleSubmit}>
            <h2>Complete seu cadastro</h2>
            {error && <div className={Style.error}><p>{error}</p></div>}
            <div className={Style.loginForm}>
              <Input value={nomeInicial} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" icon={<FaUser />} disabled={loading} />
              <div className={Style.inputRow}>
                <Input value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} placeholder="CPF" icon={<FaIdCard />} disabled={loading} />
                <Input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="Telefone" icon={<FaPhone />} disabled={loading} />
              </div>
              <InputDate selectedDate={dataNascimento} onChange={setDataNascimento} placeholderText="Nascimento" disabled={loading} />
              <Input value={cep} onChange={(e) => buscarCep(e.target.value)} placeholder="CEP" icon={<FaMapMarkerAlt />} disabled={loading} />
              <div className={Style.inputRow}>
                <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua / Logradouro" icon={<FaRoad />} disabled={loading} />
                <Input value={numero} onChange={(e) => setNumero(mascaraNumero(e.target.value))} placeholder="Numero" icon={<FaHashtag />} disabled={loading} />
              </div>
              <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" icon={<FaMapMarkerAlt />} disabled={loading} />
              <div className={Style.inputRow}>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" icon={<FaCity />} disabled={loading} />
                <Input value={estado} onChange={(e) => setEstado(mascaraUf(e.target.value))} placeholder="UF" disabled={loading} />
              </div>
              <Button type="submit" variant="primary" disabled={loading || !socialToken}>
                {loading ? 'Finalizando...' : 'Finalizar cadastro'}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
