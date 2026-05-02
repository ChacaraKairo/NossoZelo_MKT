import Link from 'next/link';
import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const passos = [
  'Crie seu cadastro como cuidador, enfermeiro ou acompanhante.',
  'Confirme seu e-mail pelo link enviado automaticamente.',
  'Acesse a aba Financeiro no perfil profissional.',
  'Escolha um plano ativo e gere a cobrança no Asaas.',
  'Pague por Pix, boleto/link ou opções disponíveis no ambiente do Asaas.',
  'Aguarde a confirmação automática do webhook.',
  'Com e-mail confirmado e assinatura ativa, seu perfil aparece nas buscas e pode receber pedidos.',
];

const perguntas = [
  {
    titulo: 'O NossoZelo coleta cartão?',
    texto:
      'Não nesta etapa. A cobrança é gerada no Asaas e o pagamento acontece no ambiente do Asaas.',
  },
  {
    titulo: 'Quando meu perfil fica ativo?',
    texto:
      'Somente depois de confirmar o e-mail e a assinatura ficar ativa. Antes disso, a conta existe, mas o perfil profissional não aparece nas buscas.',
  },
  {
    titulo: 'O que acontece se atrasar?',
    texto:
      'A assinatura pode ficar atrasada, inadimplente ou bloqueada. Enquanto estiver fora do status ativo, o prestador não aparece nas buscas e não recebe pedidos.',
  },
  {
    titulo: 'Posso reativar depois?',
    texto:
      'Sim. Ao regularizar o pagamento e o sistema receber a confirmação do Asaas, o perfil profissional volta a ficar disponível.',
  },
];

export default function AssinaturaPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />

      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Assinatura de prestadores</p>
            <h1>Ative seu perfil profissional com pagamento seguro pelo Asaas.</h1>
            <p className={Style.heroText}>
              A assinatura libera a visibilidade nas buscas e o recebimento de
              pedidos. O pagamento é confirmado automaticamente pelo sistema.
            </p>
            <div className={Style.actions}>
              <Link href="/meu-perfil?aba=financeiro" className={Style.primaryAction}>
                Ir para financeiro
              </Link>
              <Link href="/cadastro-prestador" className={Style.secondaryAction}>
                Criar cadastro
              </Link>
            </div>
          </div>
        </section>

        <section className={Style.band}>
          <div className={Style.bandText}>
            <p className={Style.eyebrow}>Fluxo de ativação</p>
            <h2>Do cadastro até o perfil ativo.</h2>
          </div>
          <ol className={Style.steps}>
            {passos.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        </section>

        <section className={Style.section}>
          <div className={Style.sectionHeader}>
            <p className={Style.eyebrow}>Política operacional</p>
            <h2>Atraso, cancelamento e reativação.</h2>
            <p>
              Prestadores com assinatura pendente, atrasada, bloqueada,
              cancelada, expirada ou falha ficam temporariamente fora das buscas
              e não recebem pedidos. A reativação ocorre após confirmação de
              pagamento pelo Asaas.
            </p>
          </div>

          <div className={Style.commitmentGrid}>
            {perguntas.map((item) => (
              <article className={Style.commitment} key={item.titulo}>
                <h3>{item.titulo}</h3>
                <p>{item.texto}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

