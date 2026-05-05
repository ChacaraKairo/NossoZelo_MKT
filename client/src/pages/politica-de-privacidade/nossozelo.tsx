import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'Dados coletados',
    texto:
      'Podemos tratar dados cadastrais, contato, CPF, endereco, perfil profissional, documentos enviados para verificacao, agendamentos, avaliacoes, logs tecnicos e status financeiro de assinatura.',
  },
  {
    titulo: 'Finalidades',
    texto:
      'Os dados sao usados para criar contas, autenticar usuarios, validar prestadores, exibir perfis, processar assinaturas, viabilizar agendamentos, prevenir fraude, prestar suporte e cumprir obrigacoes legais.',
  },
  {
    titulo: 'Pagamentos',
    texto:
      'Pagamentos sao processados por gateway externo. Numero completo de cartao e CVV nao devem ser armazenados pelo NossoZelo. Webhooks financeiros sao registrados apenas com resumo operacional e identificadores necessarios.',
  },
  {
    titulo: 'Documentos',
    texto:
      'Documentos privados devem ser armazenados em bucket privado, validados por tipo, verificados por scanner quando uploads estiverem habilitados em producao e acessados apenas por fluxo autorizado.',
  },
  {
    titulo: 'Direitos do titular',
    texto:
      'Usuarios podem solicitar acesso, correcao, revisao ou exclusao de dados conforme aplicavel. Algumas informacoes podem ser retidas pelo periodo necessario para seguranca, auditoria, disputa ou obrigacao legal.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Esta politica e uma base operacional para MVP e deve ser revisada por assessoria juridica e adequada a LGPD antes de lancamento publico.',
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
