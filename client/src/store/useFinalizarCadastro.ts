import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import {
  cadastrarUsuario,
  CadastroPayload,
} from '@/service/cadastroService';

export const useFinalizarCadastro = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    dadosPessoais,
    endereco,
    profissional,
    documentos,
    limparRascunho,
  } = useCadastroPrestadorStore();

  const prepararPayload = (): CadastroPayload => {
    const payload: CadastroPayload = {
      usuario: {
        nome: `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim(),
        email: dadosPessoais.email,
        senha: dadosPessoais.senha,
        telefone: dadosPessoais.telefone.replace(/\D/g, ''),
        cpf: dadosPessoais.cpf.replace(/\D/g, ''),
        sexo: dadosPessoais.sexo,
        data_nascimento: dadosPessoais.dataNascimento,
        cep: endereco.cep.replace(/\D/g, ''),
        endereco: `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`,
        cidade: endereco.cidade,
        estado: endereco.uf,
        pais: 'Brasil',
        tipo: profissional.categoria.toLowerCase(),
      },
    };

    const dadosProfissionais = {
      bio: profissional.bio,
      experiencia: Number(profissional.experiencia),
      valorHora: Number(profissional.valorHora),
    };

    const categoria = profissional.categoria.toLowerCase();
    if (categoria === 'enfermeiro') {
      payload.enfermeiro = {
        ...dadosProfissionais,
        coren: profissional.registro,
      };
    } else if (categoria === 'cuidador') {
      payload.cuidador = dadosProfissionais;
    } else if (categoria === 'acompanhante') {
      payload.acompanhante = dadosProfissionais;
    }

    return payload;
  };

  const executarUploads = async (usuarioId: string) => {
    const sessionId = crypto
      .randomUUID()
      .replace(/-/g, '')
      .substring(0, 15);

    console.log(
      '%c [DEBUG-NOSSOZELO] Iniciando pacote de Upload',
      'color: #007bff; font-weight: bold;',
    );
    console.log('-> ID do Usuário (MySQL):', usuarioId);
    console.log('-> ID da Sessão (S3):', sessionId);

    const formData = new FormData();
    formData.append('usuarioId', usuarioId);
    formData.append('sessionId', sessionId);

    if (documentos.foto)
      formData.append('foto', documentos.foto);
    if (documentos.identidade)
      formData.append('identidade', documentos.identidade);
    if (documentos.certificado)
      formData.append(
        'certificado',
        documentos.certificado,
      );
    if (documentos.antecedentes)
      formData.append(
        'antecedentes',
        documentos.antecedentes,
      );

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';

    try {
      const response = await fetch(
        `${API_URL}/nossozelo/upload/completar-cadastro`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const resJson = await response.json();

      if (!response.ok) {
        throw new Error(
          resJson.error ||
            resJson.message ||
            'Falha no upload/vínculo dos documentos.',
        );
      }

      console.log(
        '%c [SUCESSO] Upload e Vínculo concluídos!',
        'color: #28a745; font-weight: bold;',
      );
      return resJson;
    } catch (error: any) {
      console.error(
        '[ERRO-CONEXAO-UPLOAD]:',
        error.message,
      );
      throw error;
    }
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const payload = prepararPayload();
      const usuario = await cadastrarUsuario(payload);

      // Agora o idValido receberá o valor correto '1Mu5t...'
      const idValido = usuario.id;

      if (!idValido || idValido === 'undefined') {
        throw new Error(
          'O servidor criou o perfil, mas o Identificador Único não foi mapeado.',
        );
      }

      // 🔥 O PASSO QUE FALTAVA: Disparar os uploads com o ID real
      await executarUploads(idValido);

      alert('Cadastro realizado com sucesso!');
      limparRascunho();
      router.push('/login-parceiro');
    } catch (error: any) {
      console.error('[ERRO-FINALIZAR]:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { handleFinalizar, loading };
};
