import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Style from '@/styles/CadastroPage.module.css';

import Input from '@/components/inputs/Input';
import InputDate from '@/components/inputs/InputDate';
import Button from '@/components/btn/Button';
import Logo from '@/components/logos/OnlyLogo';

import { cadastrarUsuario } from '@/service/cadastroService';
import { mascaraCpf, mascaraTelefone, mascaraCep, mascaraNumero, mascaraUf } from '@/utils/masks';
import { cpfValido, telefoneValido, cepValido } from '@/utils/validators';

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
    FaHashtag,
    FaFileAlt,
    FaBriefcase,
} from 'react-icons/fa';

const CadastroPrestadorPage = () => {
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [sobrenome, setSobrenome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [dataNascimento, setDataNascimento] = useState<Date | null>(null);
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

    // Campos exclusivos do cuidador
    const [bio, setBio] = useState('');
    const [anosExperiencia, setAnosExperiencia] = useState('');
    const [documentoProfissional, setDocumentoProfissional] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                        setError(null);
                    } else {
                        setError('CEP não encontrado.');
                    }
                } catch (err) {
                    console.error('Erro ao buscar CEP:', err);
                }
            }
        };
        buscarCep();
    }, [cep]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!cpfValido(cpf)) {
            setError('CPF inválido. Digite os 11 dígitos.');
            return;
        }
        if (!telefoneValido(telefone)) {
            setError('Telefone inválido. Digite DDD + número.');
            return;
        }
        if (!cepValido(cep)) {
            setError('CEP inválido. Digite os 8 dígitos.');
            return;
        }
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem!');
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
                cidade,
                estado,
                pais: 'Brasil',
                url_foto_perfil: '',
                tipo: 'cuidador' as const,
                email_confirmado: false,
            },
            cuidador: {
                bio: bio || undefined,
                anos_experiencia: anosExperiencia ? parseInt(anosExperiencia) : undefined,
                documento_profissional: documentoProfissional || undefined,
            },
        };

        try {
            await cadastrarUsuario(dadosCadastro);
            alert('Cadastro realizado com sucesso!');
            router.push('/login-user');
        } catch (err: any) {
            setError(err.message || 'Erro ao completar o cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={Style.loginPage}>
            <header className={Style.header}>
                <div className={Style.headerbar}>
                    <div className={Style.logoWrapper}>
                        <Logo />
                    </div>
                </div>
            </header>
            <main className={Style.main}>
                <section className={Style.formSection}>
                    <form className={Style.form} onSubmit={handleSubmit}>
                        <h2>Cadastro de Cuidador</h2>
                        <Button variant="secondary" onClick={() => router.push('/cadastro-user')}>
                            Desejo me cadastrar como cliente
                        </Button>
                        <br/>
                        <div className={Style.loginForm}>
                            {error && <p className={Style.error}>{error}</p>}

                            <div className={Style.inputRow}>
                                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" icon={<FaUser />} disabled={loading} />
                                <Input value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} placeholder="Sobrenome" disabled={loading} />
                            </div>

                            <div className={Style.inputRow}>
                            <Input value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} placeholder="CPF (000.000.000-00)" icon={<FaIdCard />} disabled={loading} />
                            <Input value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="Telefone ((00) 00000-0000)" icon={<FaPhone />} type="tel" disabled={loading} />
                            </div>

                            <div className={Style.inputRow}>
                                <InputDate selectedDate={dataNascimento} onChange={(date) => setDataNascimento(date)} placeholderText="Nascimento" disabled={loading} />
                                <div className={Style.inputContainer}>
                                    <span className={`${Style.icon} ${Style.left}`}><FaVenusMars /></span>
                                    <select value={sexo} onChange={(e) => setSexo(e.target.value)} className={`${Style.inputField} ${Style.withIconLeft}`} disabled={loading}>
                                        <option value="outro">Gênero: Outro</option>
                                        <option value="feminino">Feminino</option>
                                        <option value="masculino">Masculino</option>
                                    </select>
                                </div>
                            </div>

                            <Input value={cep} onChange={(e) => setCep(mascaraCep(e.target.value))} placeholder="CEP (00000-000)" icon={<FaMapMarkerAlt />} disabled={loading} />

                            <div className={Style.inputRow}>
                                <div style={{ flex: 3 }}>
                                    <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua / Logradouro" icon={<FaRoad />} disabled={loading} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Input value={numero} onChange={(e) => setNumero(mascaraNumero(e.target.value))} placeholder="Nº" icon={<FaHashtag />} disabled={loading} />
                                </div>
                            </div>

                            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" icon={<FaMapMarkerAlt />} disabled={loading} />

                            <div className={Style.inputRow}>
                                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" icon={<FaCity />} disabled={loading} />
                                <Input value={estado} onChange={(e) => setEstado(mascaraUf(e.target.value))} placeholder="UF" disabled={loading} />
                            </div>

                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" type="email" icon={<FaEnvelope />} disabled={loading} />

                            <Input value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha" type={mostrarSenha ? 'text' : 'password'} icon={mostrarSenha ? <FaEyeSlash /> : <FaEye />} iconPosition="right" onIconClick={() => setMostrarSenha(!mostrarSenha)} disabled={loading} />

                            <Input value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Confirme a senha" type="password" icon={<FaLock />} iconPosition="right" disabled={loading} />

                            {/* Campos exclusivos do cuidador */}
                            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio (apresentação)" icon={<FaUser />} disabled={loading} />

                            <Input value={anosExperiencia} onChange={(e) => setAnosExperiencia(e.target.value)} placeholder="Anos de experiência" type="number" icon={<FaBriefcase />} disabled={loading} />

                            <Input value={documentoProfissional} onChange={(e) => setDocumentoProfissional(e.target.value)} placeholder="Documento profissional" icon={<FaFileAlt />} disabled={loading} />

                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Cadastrando...' : 'Cadastrar como Cuidador'}
                            </Button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default CadastroPrestadorPage;
