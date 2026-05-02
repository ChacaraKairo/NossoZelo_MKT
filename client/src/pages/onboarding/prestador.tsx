import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import HeaderHome from '@/components/header/HeaderHome';
import Carregando from '@/components/common/Carregando';
import ModalPagamentoAssinatura from '@/components/perfil/ModalPagamentoAssinatura';
import { emailConfirmacaoService } from '@/service/emailConfirmacaoService';
import { onboardingService } from '@/service/onboardingService';
import { PlanoAssinatura } from '@/types/assinatura';
import { OnboardingStatus } from '@/types/onboarding';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/OnboardingPrestadorPage.module.css';

const etapas = [
  ['confirmar_email', 'Confirmar e-mail'],
  ['completar_perfil', 'Completar perfil'],
  ['escolher_plano', 'Escolher plano'],
  ['pagar_assinatura', 'Gerar pagamento'],
  ['aguardando_confirmacao_pagamento', 'Aguardar confirmacao'],
  ['ativo', 'Perfil ativo'],
] as const;

function moeda(valor: number | string) {
  const numero = Number(valor);
  return Number.isFinite(numero)
    ? numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'Valor nao informado';
}

function boolTexto(valor: boolean) {
  return valor ? 'Sim' : 'Nao';
}

export default function OnboardingPrestadorPage() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([]);
  const [planoId, setPlanoId] = useState<number | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const etapaAtual = status?.etapaAtual || 'confirmar_email';
  const deveListarPlanos =
    etapaAtual === 'escolher_plano' ||
    etapaAtual === 'pagar_assinatura' ||
    etapaAtual === 'inadimplente';

  async function carregar() {
    try {
      setErro(null);
      const statusAtual = await onboardingService.obterStatusOnboarding();
      setStatus(statusAtual);

      if (statusAtual.isPrestador && statusAtual.etapaAtual !== 'confirmar_email') {
        const lista = await onboardingService.listarPlanos();
        setPlanos(lista);
        setPlanoId((atual) => atual || statusAtual.assinatura?.plano_id || lista[0]?.id || null);
      }
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const indiceAtual = useMemo(() => {
    const indice = etapas.findIndex(([id]) => id === etapaAtual);
    if (etapaAtual === 'inadimplente' || etapaAtual === 'bloqueado') return 3;
    return indice >= 0 ? indice : 0;
  }, [etapaAtual]);

  async function reenviarConfirmacao() {
    try {
      setMensagem(null);
      setErro(null);
      const resposta = await emailConfirmacaoService.reenviarConfirmacao();
      setMensagem(resposta.message);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  }

  if (loading) return <Carregando mensagem="Carregando onboarding..." />;

  return (
    <div className={styles.page}>
      <HeaderHome variant="public" />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <h1>Ativacao do perfil profissional</h1>
            <p>
              Seu cadastro ainda nao esta ativo para buscas e pedidos. Conclua as etapas
              abaixo para liberar seu perfil profissional.
            </p>
          </div>
          <span className={styles.statusBadge}>{status?.etapaAtual || 'carregando'}</span>
        </section>

        <section className={styles.stepper} aria-label="Etapas do onboarding">
          {etapas.map(([id, label], index) => (
            <div
              key={id}
              className={`${styles.step} ${index === indiceAtual ? styles.stepActive : ''}`}
            >
              <strong>{index + 1}. {label}</strong>
              <span>{index < indiceAtual ? 'Concluido' : index === indiceAtual ? 'Etapa atual' : 'Pendente'}</span>
            </div>
          ))}
        </section>

        <div className={styles.layout}>
          <section className={styles.panel}>
            <h2>{status?.proximaAcao || 'Continue seu cadastro'}</h2>
            <p>
              A confirmacao do pagamento pode levar ate 72 horas. Enquanto isso,
              seu perfil nao aparece nas buscas nem recebe pedidos.
            </p>

            {erro && <div className={styles.error}>{erro}</div>}
            {mensagem && <div className={styles.success}>{mensagem}</div>}

            {etapaAtual === 'confirmar_email' && (
              <div className={styles.actions}>
                <button type="button" className={styles.button} onClick={reenviarConfirmacao}>
                  Reenviar confirmacao de e-mail
                </button>
              </div>
            )}

            {etapaAtual === 'completar_perfil' && (
              <div className={styles.actions}>
                <Link className={styles.button} href="/meu-perfil?editar=1">
                  Completar perfil profissional
                </Link>
              </div>
            )}

            {deveListarPlanos && (
              <>
                {planos.length === 0 ? (
                  <div className={styles.notice}>
                    Nenhum plano disponivel no momento. Tente novamente mais tarde.
                  </div>
                ) : (
                  <div className={styles.plans}>
                    {planos.map((plano) => (
                      <button
                        key={plano.id}
                        type="button"
                        className={`${styles.plan} ${planoId === plano.id ? styles.planActive : ''}`}
                        onClick={() => setPlanoId(plano.id)}
                      >
                        <strong>{plano.nome}</strong>
                        <span>{moeda(plano.valor)} / mes</span>
                        {plano.beneficios && <small>{plano.beneficios}</small>}
                      </button>
                    ))}
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    disabled={!planoId || planos.length === 0}
                    onClick={() => setModalAberto(true)}
                  >
                    Gerar pagamento da assinatura
                  </button>
                </div>
              </>
            )}

            {etapaAtual === 'aguardando_confirmacao_pagamento' && (
              <div className={styles.notice}>
                Pagamento em analise. Se voce ainda nao concluiu o pagamento, gere uma nova
                cobranca pela area financeira ou selecione um plano nesta tela.
              </div>
            )}

            {etapaAtual === 'ativo' && (
              <div className={styles.actions}>
                <Link className={styles.button} href="/meu-perfil">
                  Ir para meu perfil
                </Link>
              </div>
            )}
          </section>

          <aside className={styles.panel}>
            <h2>Resumo</h2>
            <div className={styles.summary}>
              <div className={styles.summaryItem}><span>E-mail confirmado</span><strong>{boolTexto(Boolean(status?.emailConfirmado))}</strong></div>
              <div className={styles.summaryItem}><span>Perfil completo</span><strong>{boolTexto(Boolean(status?.possuiDadosProfissionais))}</strong></div>
              <div className={styles.summaryItem}><span>Assinatura</span><strong>{status?.assinaturaStatus || 'sem assinatura'}</strong></div>
              <div className={styles.summaryItem}><span>Status cadastro</span><strong>{status?.statusCadastro || '-'}</strong></div>
              <div className={styles.summaryItem}><span>Aparece nas buscas</span><strong>{boolTexto(Boolean(status?.podeAparecerNaBusca))}</strong></div>
              <div className={styles.summaryItem}><span>Recebe pedidos</span><strong>{boolTexto(Boolean(status?.podeReceberPedidos))}</strong></div>
            </div>
          </aside>
        </div>
      </main>

      <ModalPagamentoAssinatura
        aberto={modalAberto}
        modo={status?.possuiAssinatura ? 'regularizar' : 'iniciar'}
        planoId={planoId}
        statusAssinatura={status?.assinaturaStatus || 'pendente'}
        onFechar={() => setModalAberto(false)}
        onSucesso={(texto) => {
          setMensagem(texto);
          carregar();
        }}
      />
    </div>
  );
}
