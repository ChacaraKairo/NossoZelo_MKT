import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'Natureza da plataforma',
    texto:
      'O NossoZelo conecta clientes a profissionais de cuidado. A plataforma ajuda no cadastro, busca, pedidos, cancelamentos, avaliacoes e suporte, mas o atendimento e prestado pelo profissional escolhido.',
  },
  {
    titulo: 'Cadastro de clientes e profissionais',
    texto:
      'Usuarios devem informar dados verdadeiros e manter suas contas protegidas. Profissionais podem precisar confirmar e-mail, completar perfil, manter assinatura ativa e apresentar documentos quando solicitado.',
  },
  {
    titulo: 'Assinatura do profissional',
    texto:
      'A cobranca realizada pelo NossoZelo refere-se apenas a assinatura mensal dos prestadores para uso profissional da plataforma, visibilidade nas buscas e recebimento de solicitacoes.',
  },
  {
    titulo: 'Pagamento do atendimento',
    texto:
      'O NossoZelo nao processa, intermedeia, retem ou repassa valores referentes aos servicos contratados entre clientes e prestadores. O pagamento do atendimento, quando houver, e combinado e realizado diretamente entre cliente e prestador, fora da plataforma.',
  },
  {
    titulo: 'Cancelamento sem cobranca pela plataforma',
    texto:
      'Nesta versao, cancelamentos ficam registrados no historico com data, responsavel e motivo. O NossoZelo nao cobra multa, nao processa reembolso e nao participa de valores combinados diretamente entre as partes.',
  },
  {
    titulo: 'Avaliacoes',
    texto:
      'Depois do horario final do atendimento, cliente e profissional podem se avaliar uma unica vez por pedido. Avaliacoes ofensivas, falsas ou que exponham dados sensiveis podem ser moderadas.',
  },
  {
    titulo: 'Responsabilidades e suspensao',
    texto:
      'A plataforma pode suspender contas em caso de fraude, risco a pessoas, uso indevido, dados falsos, exposicao de dados sensiveis ou violacao destes termos.',
  },
  {
    titulo: 'Suporte',
    texto:
      'Problemas com atendimento, cancelamento, assinatura do prestador ou dados pessoais devem ser enviados aos canais oficiais de suporte.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Este documento e uma base operacional para MVP e deve ser revisado por assessoria juridica antes do lancamento publico.',
  },
];

export default function TermosDeUsoPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />
      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Termos de uso</p>
            <h1>Regras para usar o NossoZelo.</h1>
            <p className={Style.heroText}>
              Estes termos explicam como funcionam cadastro, pedidos,
              assinatura dos profissionais, cancelamentos e avaliacoes.
            </p>
          </div>
        </section>

        <section className={Style.section}>
          <div className={Style.commitmentGrid}>
            {secoes.map((secao) => (
              <article className={Style.commitment} key={secao.titulo}>
                <h3>{secao.titulo}</h3>
                <p>{secao.texto}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
