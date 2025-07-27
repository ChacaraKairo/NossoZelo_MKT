import { useState } from 'react';

const SEXO_OPCOES = [
  'masculino',
  'feminino',
  'outro',
] as const;
const TIPO_OPCOES = [
  'cliente',
  'cuidador',
  'enfermeiro',
  'admin',
  'acompanhante',
] as const;

export default function useCadastroForm() {
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: '',
    data_nascimento: '', // espera string yyyy-MM-dd
    endereco: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    url_foto_perfil: '',
    tipo: 'cliente', // inicializa cliente válido
    sexo: 'outro', // inicializa outro válido
  });

  const [extra, setExtra] = useState({
    bio: '',
    coren: '',
    especialidade: '',
    anos_experiencia: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setExtra((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.senha !== form.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    // Normaliza sexo e tipo para evitar erros
    const sexoNormalized = SEXO_OPCOES.includes(
      form.sexo as any,
    )
      ? form.sexo
      : 'outro';

    const tipoNormalized = TIPO_OPCOES.includes(
      form.tipo as any,
    )
      ? form.tipo
      : 'cliente';

    // Converte data_nascimento para ISO se preenchida
    let dataNascimentoISO = null;
    if (form.data_nascimento) {
      const dt = new Date(form.data_nascimento);
      if (!isNaN(dt.getTime())) {
        dataNascimentoISO = dt.toISOString();
      }
    }

    const payload: any = {
      usuario: {
        nome:
          form.nome.trim() + ' ' + form.sobrenome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        telefone: form.telefone.trim(),
        cpf: form.cpf.trim(),
        data_nascimento: dataNascimentoISO,
        endereco: form.endereco.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim(),
        pais: form.pais.trim(),
        url_foto_perfil: form.url_foto_perfil.trim(),
        tipo: tipoNormalized,
        sexo: sexoNormalized,
        criado_em: new Date().toISOString(),
      },
    };

    if (tipoNormalized === 'cuidador') {
      payload.cuidador = {
        bio: extra.bio.trim(),
        anos_experiencia: parseInt(
          extra.anos_experiencia || '0',
          10,
        ),
      };
    } else if (tipoNormalized === 'enfermeiro') {
      payload.enfermeiro = {
        coren: extra.coren.trim(),
        especialidade: extra.especialidade.trim(),
        anos_experiencia: parseInt(
          extra.anos_experiencia || '0',
          10,
        ),
      };
    } else if (tipoNormalized === 'admin') {
      payload.admin = {};
    }

    try {
      const response = await fetch(
        'http://localhost:4000/nossozelo/create-users/usuario',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        // Detecta erro de email duplicado no texto da resposta
        if (
          errorText
            .toLowerCase()
            .includes('email já cadastrado') ||
          errorText
            .toLowerCase()
            .includes('unique constraint')
        ) {
          alert(
            'Este email já está em uso. Por favor, use outro.',
          );
        } else {
          alert(`Erro: ${response.status} - ${errorText}`);
        }

        throw new Error(
          `Erro: ${response.status} - ${errorText}`,
        );
      }

      alert('Cadastro realizado com sucesso!');
    } catch (err) {
      console.error(err);
      // Caso erro já tenha sido tratado acima, aqui pode mostrar alerta genérico
      if (!(err instanceof Error)) {
        alert('Erro ao cadastrar');
      }
    }
  };

  return {
    form,
    extra,
    handleChange,
    handleExtraChange,
    handleSubmit,
  };
}
