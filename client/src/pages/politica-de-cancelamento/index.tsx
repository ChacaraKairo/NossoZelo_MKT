import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'Solicitacao pendente',
    texto:
      'Enquanto o profissional ainda nao aceitou o pedido, o cliente pode cancelar a solicitacao e o profissional pode recusar. Nenhum pagamento e processado pelo NossoZelo.',
  },
  {
    titulo: 'Atendimento confirmado',
    texto:
      'Depois do aceite, cliente ou profissional podem cancelar antes do horario de inicio. O motivo fica registrado para transparancia e acompanhamento do historico.',
  },
  {
    titulo: 'Cancelamento proximo ao horario',
    texto:
      'Quando o cancelamento acontece perto do horario do atendimento, ele pode ser marcado como cancelamento tardio. Isso nao gera multa pela plataforma, mas fica registrado no historico.',
  },
  {
    titulo: 'Atendimento nao realizado',
    texto:
      'Se o horario de inicio ja passou, o atendimento nao deve virar apenas cancelado. Cliente ou profissional podem marcar como nao realizado, informando o motivo.',
  },
  {
    titulo: 'Atendimento concluido',
    texto:
      'Atendimentos concluidos nao podem ser cancelados. Depois do horario final, cliente e profissional podem registrar suas avaliacoes quando as regras forem atendidas.',
  },
  {
    titulo: 'Sem multa ou reembolso pela plataforma',
    texto:
      'Nesta versao da plataforma, o NossoZelo nao cobra multa de cancelamento de clientes ou prestadores. Tambem nao realiza reembolso de valores combinados diretamente entre cliente e prestador, pois o pagamento do servico nao e processado pela plataforma.',
  },
  {
    titulo: 'Pagamento direto entre as partes',
    texto:
      'Qualquer valor do atendimento, quando existir, deve ser combinado e resolvido diretamente entre cliente e profissional, fora do NossoZelo.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Este documento e uma base operacional para MVP e deve ser revisado por assessoria juridica antes do lancamento publico.',
  },
];

export default function PoliticaCancelamentoPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />
      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Politica de cancelamento</p>
            <h1>Cancelamentos claros e sem cobranca pela plataforma.</h1>
            <p className={Style.heroText}>
              Entenda como pedidos podem ser cancelados ou marcados como nao
              realizados no MVP do NossoZelo.
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
