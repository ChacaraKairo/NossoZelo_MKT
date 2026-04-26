import React, { useRef } from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import { useFinalizarCadastro } from '@/store/useFinalizarCadastro';
import {
  FaCheckCircle,
  FaUser,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFileAlt,
  FaArrowRight,
  FaArrowLeft,
} from 'react-icons/fa';

// Importe o CSS com o nome 'Style' para bater com o que usamos abaixo
import Style from '@/styles/Wizard.module.css';

import StepPessoais from '@/components/cadastro/StepPessoais';
import StepEndereco from '@/components/cadastro/StepEndereco';
import StepProfissional from '@/components/cadastro/StepProfissional';
import StepDocumentos from '@/components/cadastro/StepDocumentos';

const WizardCadastroPrestador = () => {
  const { step, setStep, validarEtapa, erros } =
    useCadastroPrestadorStore();
  const { handleFinalizar, loading } =
    useFinalizarCadastro();
  const stepContentRef = useRef<HTMLElement | null>(null);

  const totalSteps = 4;
  const possuiErros = Object.keys(erros).length > 0;
  const mensagensErro = Object.values(erros).filter(
    (mensagem): mensagem is string => Boolean(mensagem),
  );

  const nextStep = () => {
    const etapaValida = validarEtapa(step);

    if (etapaValida && step < totalSteps) {
      setStep(step + 1);
      return;
    }

    stepContentRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const stepsConfig = [
    { id: 1, title: 'Pessoais', icon: <FaUser /> },
    { id: 2, title: 'Endereço', icon: <FaMapMarkerAlt /> },
    { id: 3, title: 'Profissional', icon: <FaBriefcase /> },
    { id: 4, title: 'Documentos', icon: <FaFileAlt /> },
  ];

  // Cálculo da porcentagem para a barra de progresso
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className={Style.wizardPage}>
      <div className={Style.wizardContainer}>
        {/* Cabeçalho */}
        <header className={Style.wizardHeader}>
          <h2>Cadastro de Prestador</h2>
          <button
            className={Style.btnDraft}
            onClick={() => alert('Rascunho salvo!')}
          >
            Salvar Rascunho
          </button>
        </header>

        {/* Barra de Progresso (Stepper) */}
        <div className={Style.progressWrapper}>
          <div className={Style.progressBar}>
            <div
              className={Style.progressFill}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className={Style.stepIndicators}>
            {stepsConfig.map((s) => (
              <span
                key={s.id}
                className={
                  step === s.id ? Style.activeStep : ''
                }
              >
                {s.icon}{' '}
                <small className={Style.hideMobile}>
                  {s.title}
                </small>
              </span>
            ))}
          </div>
        </div>

        {/* Conteúdo do Formulário */}
        <main className={Style.stepContent} ref={stepContentRef}>
          <section className={Style.stepForm}>
            {possuiErros && (
              <div
                className={Style.validationBanner}
                role="alert"
                aria-live="polite"
              >
                <p>
                  Revise os campos destacados antes de avancar para a proxima etapa.
                </p>
                <ul className={Style.validationList}>
                  {mensagensErro.map((mensagem, index) => (
                    <li key={`${mensagem}-${index}`}>{mensagem}</li>
                  ))}
                </ul>
              </div>
            )}
            {step === 1 && <StepPessoais />}
            {step === 2 && <StepEndereco />}
            {step === 3 && <StepProfissional />}
            {step === 4 && <StepDocumentos />}
          </section>
        </main>

        {/* Rodapé de Navegação */}
        <footer className={Style.wizardFooter}>
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className={Style.btnBack}
          >
            <FaArrowLeft /> Voltar
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className={Style.btnNext}
              type="button"
            >
              Próximo Passo <FaArrowRight />
            </button>
          ) : (
            <button
              onClick={handleFinalizar}
              disabled={loading}
              className={Style.btnSubmit}
            >
              {loading ? (
                'Processando...'
              ) : (
                <>
                  <FaCheckCircle /> Enviar para Análise
                </>
              )}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default WizardCadastroPrestador;
