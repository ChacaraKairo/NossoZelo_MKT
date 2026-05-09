import { useState } from 'react';
import { useRouter } from 'next/router';
import { getNossoZeloApiUrl } from '@/config/api';
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
    validarEtapa,
    setStep,
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
        bairro: endereco.bairro,
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
      valorDiaria: Number(profissional.valorDiaria),
      disponibilidade: profissional.disponibilidade,
      especialidades: profissional.especialidades,
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

  const executarUploads = async (
    usuarioId: string,
    uploadToken: string,
  ) => {
    if (!uploadToken) {
      throw new Error(
        'Token temporario de upload nao recebido do servidor.',
      );
    }

    const sessionId = crypto
      .randomUUID()
      .replace(/-/g, '')
      .substring(0, 15);const formData = new FormData();
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

    try {
      const response = await fetch(
        `${getNossoZeloApiUrl()}/upload/completar-cadastro`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${uploadToken}`,
          },
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
      }      return resJson;
    } catch (error: any) {      throw error;
    }
  };

  const handleFinalizar = async () => {
    if (!validarEtapa(4)) {
      alert('Revise os documentos obrigatórios antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const payload = prepararPayload();
      const usuario = await cadastrarUsuario(payload);

      // Agora o idValido receberá o valor correto '1Mu5t...'
      const idValido = usuario.id;
      const uploadToken = usuario.uploadToken || usuario.upload_token;

      if (!idValido || idValido === 'undefined') {
        throw new Error(
          'O servidor criou o perfil, mas o Identificador Único não foi mapeado.',
        );
      }

      // 🔥 O PASSO QUE FALTAVA: Disparar os uploads com o ID real
      await executarUploads(idValido, uploadToken);

      const avisoEmail = usuario.data?.aviso_confirmacao_email
        ? ` ${usuario.data.aviso_confirmacao_email}`
        : '';
      alert(
        `Cadastro recebido. Após confirmar seu e-mail, acesse a área financeira para ativar sua assinatura e liberar seu perfil profissional.${avisoEmail}`,
      );
      setStep(5);
      router.push('/cadastro-prestador?email_enviado=1');
    } catch (error: any) {      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  return { handleFinalizar, loading };
};
