// src/pages/cadastro-prestador/index.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import { FaCheckCircle, FaSave } from 'react-icons/fa';
import Style from '@/styles/Wizard.module.css';

// Importação do nosso serviço de API
import {
  cadastrarUsuario,
  CadastroPayload,
} from '@/service/cadastroService';

// Importação das Etapas
import StepPessoais from '@/components/cadastro/StepPessoais';
import StepEndereco from '@/components/cadastro/StepEndereco';
import StepProfissional from '@/components/cadastro/StepProfissional';
import StepDocumentos from '@/components/cadastro/StepDocumentos';

const WizardCadastroPrestador = () => {
  const router = useRouter();

  const {
    step,
    setStep,
    dadosPessoais,
    endereco,
    profissional,
    documentos,
    limparRascunho,
    validarEtapa,
  } = useCadastroPrestadorStore();

  const [loading, setLoading] = useState(false);

  const totalSteps = 4;
  const progresso = (step / totalSteps) * 100;

  const nextStep = () => {
    const etapaValida = validarEtapa(step);
    if (etapaValida && step < totalSteps) {
      setStep(step + 1);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSalvarRascunho = () => {
    alert(
      'Progresso salvo com sucesso! Você pode voltar mais tarde.',
    );
    router.push('/home');
  };

  // 🔥 FUNÇÃO AUXILIAR DE UPLOAD DE ARQUIVOS (ATUALIZADA COM NOME CUSTOMIZADO)
  const fazerUploadDeArquivo = async (
    arquivo: File,
    pasta: string,
    sessionId: string,
    codigoTipo: number,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('pasta', pasta);

    // Dizemos ao backend o nome exato que queremos (ex: asdf123_1)
    formData.append(
      'nomeCustomizado',
      `${sessionId}_${codigoTipo}`,
    );

    const URL_API =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';

    const resposta = await fetch(
      `${URL_API}/nossozelo/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    if (!resposta.ok) {
      throw new Error(
        `Falha ao fazer upload do arquivo na pasta ${pasta}`,
      );
    }

    const dados = await resposta.json();
    return dados.url;
  };

  // LÓGICA FINAL DO CADASTRO
  const finalizarCadastro = async () => {
    const etapaFinalValida = validarEtapa(step);
    if (!etapaFinalValida) {
      alert(
        'Por favor, corrija os erros apontados antes de enviar.',
      );
      return;
    }

    setLoading(true);

    try {
      // 🔥 GERA O ID ÚNICO DA SESSÃO (15 caracteres)
      const sessionId = crypto
        .randomUUID()
        .replace(/-/g, '')
        .substring(0, 15);

      // 1. UPLOAD REAL DE ARQUIVOS COM NOMENCLATURA PADRONIZADA!
      let urlFotoPerfil = '';
      let urlIdentidade = '';

      // Código 1 = Foto
      if (documentos.foto) {
        urlFotoPerfil = await fazerUploadDeArquivo(
          documentos.foto,
          'fotos',
          sessionId,
          1,
        );
      }

      // Código 2 = Documento de Identidade
      if (documentos.identidade) {
        urlIdentidade = await fazerUploadDeArquivo(
          documentos.identidade,
          'documentos',
          sessionId,
          2,
        );
      }

      // 2. Mapeamento Zustand -> Backend (Agora com as URLs reais injetadas)
      const payload: CadastroPayload = {
        usuario: {
          nome: `${dadosPessoais.nome} ${dadosPessoais.sobrenome}`.trim(),
          email: dadosPessoais.email,
          senha: dadosPessoais.senha,
          telefone: dadosPessoais.telefone.replace(
            /\D/g,
            '',
          ),
          cpf: dadosPessoais.cpf.replace(/\D/g, ''),
          sexo: dadosPessoais.sexo,
          data_nascimento: dadosPessoais.dataNascimento,
          cep: endereco.cep.replace(/\D/g, ''),
          endereco: `${endereco.rua}, ${endereco.numero} - ${endereco.bairro}`,
          cidade: endereco.cidade,
          estado: endereco.uf,
          pais: 'Brasil',
          url_foto_perfil: urlFotoPerfil, // 🔥 URL da foto
          tipo: profissional.categoria.toLowerCase(),
        },
      };

      // 3. Objeto com os Dados Profissionais base
      const dadosProfissionais = {
        bio: profissional.bio,
        experiencia: Number(profissional.experiencia),
        valorHora: Number(profissional.valorHora),
        documentos: urlIdentidade, // 🔥 URL do PDF/Identidade
      };

      // 4. Anexa a tabela correta dependendo da categoria escolhida
      const categoria =
        profissional.categoria.toLowerCase();

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

      // 5. Chamada real à API para salvar no MySQL (Prisma)
      await cadastrarUsuario(payload);

      // 6. Sucesso!
      alert(
        'Recebemos seus dados e arquivos! Nossa equipe analisará em até 48h.',
      );
      limparRascunho();
      router.push('/login-parceiro');
    } catch (error: any) {
      console.error(error);
      alert(
        error.message ||
          'Erro ao finalizar o cadastro ou fazer upload. Verifique os dados informados.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Style.wizardPage}>
      <main className={Style.wizardContainer}>
        {/* CABEÇALHO DO WIZARD */}
        <header className={Style.wizardHeader}>
          <h2>Credenciamento de Prestador</h2>
          <button
            onClick={handleSalvarRascunho}
            className={Style.btnDraft}
          >
            <FaSave /> Salvar Rascunho
          </button>
        </header>

        {/* BARRA DE PROGRESSO */}
        <div className={Style.progressWrapper}>
          <div className={Style.progressBar}>
            <div
              className={Style.progressFill}
              style={{
                width: `${progresso}%`,
                backgroundColor: '#0cc0df',
              }}
            />
          </div>
          <div className={Style.stepIndicators}>
            <span
              className={step >= 1 ? Style.activeStep : ''}
            >
              Pessoais
            </span>
            <span
              className={step >= 2 ? Style.activeStep : ''}
            >
              Endereço
            </span>
            <span
              className={step >= 3 ? Style.activeStep : ''}
            >
              Profissional
            </span>
            <span
              className={step >= 4 ? Style.activeStep : ''}
            >
              Documentos
            </span>
          </div>
        </div>

        {/* RENDERIZAÇÃO CONDICIONAL DAS ETAPAS */}
        <section className={Style.stepContent}>
          {step === 1 && <StepPessoais />}
          {step === 2 && <StepEndereco />}
          {step === 3 && <StepProfissional />}
          {step === 4 && <StepDocumentos />}
        </section>

        {/* CONTROLES DE NAVEGAÇÃO */}
        <footer className={Style.wizardFooter}>
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={Style.btnBack}
          >
            Voltar
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className={Style.btnNext}
            >
              Próximo Passo
            </button>
          ) : (
            <button
              onClick={finalizarCadastro}
              disabled={loading}
              className={Style.btnSubmit}
            >
              {loading ? (
                'Enviando e Salvando Fotos...' // 🔥 Mensagem mais clara pro usuário
              ) : (
                <>
                  <FaCheckCircle /> Enviar para Análise
                </>
              )}
            </button>
          )}
        </footer>
      </main>
    </div>
  );
};

export default WizardCadastroPrestador;
