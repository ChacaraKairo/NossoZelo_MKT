import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'Natureza da plataforma',
    texto:
      'O NossoZelo conecta clientes a prestadores de cuidado. A plataforma organiza cadastro, busca, agendamento, assinatura profissional, avaliacoes e canais de suporte, mas a prestacao do servico depende do profissional contratado.',
  },
  {
    titulo: 'Contas e responsabilidades',
    texto:
      'Clientes e prestadores devem fornecer dados verdadeiros, manter credenciais protegidas e usar a plataforma de forma licita. Prestadores podem passar por verificacao documental e operacional antes de aparecerem nas buscas.',
  },
  {
    titulo: 'Agendamentos e cancelamentos',
    texto:
      'Solicitacoes, aceite, cancelamento e finalizacao seguem as regras operacionais vigentes. Cancelamentos recorrentes, fraude, abuso ou risco a usuarios podem gerar bloqueio temporario ou permanente.',
  },
  {
    titulo: 'Pagamentos e assinaturas',
    texto:
      'Assinaturas de prestadores sao processadas pelo Asaas. O perfil profissional so fica ativo depois de confirmacao confiavel de pagamento. Pagamentos por servico, comissao, reembolso e disputa devem seguir politica propria quando habilitados.',
  },
  {
    titulo: 'Denuncias e moderacao',
    texto:
      'Usuarios podem reportar condutas inadequadas, perfis falsos, documentos suspeitos, faltas, cobrancas indevidas ou risco a pessoas. A plataforma pode suspender perfis enquanto analisa uma ocorrencia.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Este texto e uma base operacional para MVP e deve ser revisado por assessoria juridica antes de lancamento publico ou venda comercial.',
  },
];

export default function TermosNossoZeloPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />
      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Termos de uso</p>
            <h1>Regras basicas para usar o NossoZelo.</h1>
            <p className={Style.heroText}>
              Estes termos descrevem as responsabilidades minimas de clientes,
              prestadores e plataforma durante o MVP controlado.
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
