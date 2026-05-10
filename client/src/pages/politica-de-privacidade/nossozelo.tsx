import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'Dados coletados',
    texto:
      'Podemos usar dados de cadastro, contato, CPF, endereco, perfil profissional, documentos enviados para verificacao, localizacao, agendamentos, cancelamentos, avaliacoes e assinatura do prestador.',
  },
  {
    titulo: 'Finalidades',
    texto:
      'Os dados sao usados para criar contas, autenticar usuarios, validar prestadores, exibir perfis, processar assinaturas, viabilizar agendamentos, prevenir fraude, prestar suporte e cumprir obrigacoes legais.',
  },
  {
    titulo: 'Assinatura do prestador',
    texto:
      'Dados necessarios para cobranca da assinatura mensal do prestador podem ser compartilhados com o Asaas. O NossoZelo nao deve guardar numero completo de cartao nem codigo de seguranca.',
  },
  {
    titulo: 'Pagamento de atendimentos',
    texto:
      'Os pagamentos de servicos entre cliente e prestador sao realizados fora da plataforma. O NossoZelo nao solicita nem armazena dados de pagamento referentes ao servico contratado, salvo se futuramente for disponibilizado recurso especifico mediante atualizacao desta politica.',
  },
  {
    titulo: 'Agendamentos, cancelamentos e avaliacoes',
    texto:
      'O NossoZelo pode tratar data, horario, tipo de servico, cliente, prestador, status da solicitacao, historico de cancelamento e avaliacoes para funcionamento, seguranca, suporte e melhoria da experiencia.',
  },
  {
    titulo: 'Cookies e logs de seguranca',
    texto:
      'Podemos usar cookies essenciais para login e seguranca da sessao, alem de logs tecnicos para proteger contas, investigar erros e evitar uso indevido.',
  },
  {
    titulo: 'Documentos',
    texto:
      'Documentos privados devem ficar protegidos e acessiveis apenas quando forem necessarios para verificacao ou suporte.',
  },
  {
    titulo: 'Direitos do titular',
    texto:
      'Usuarios podem solicitar acesso, correcao, revisao ou exclusao de dados conforme aplicavel. Algumas informacoes podem ser retidas pelo periodo necessario para seguranca, auditoria, disputa ou obrigacao legal.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Este documento e uma base operacional para MVP e deve ser revisado por assessoria juridica antes do lancamento publico.',
  },
];

export default function PrivacidadeNossoZeloPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />
      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Privacidade</p>
            <h1>Como o NossoZelo trata dados pessoais.</h1>
            <p className={Style.heroText}>
              Esta pagina resume os dados usados para operar cadastro,
              verificacao, assinatura, agendamento e suporte.
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
