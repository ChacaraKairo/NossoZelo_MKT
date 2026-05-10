import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';

const secoes = [
  {
    titulo: 'O que sao cookies',
    texto:
      'Cookies sao pequenos arquivos usados pelo navegador para lembrar informacoes importantes, como sua sessao e preferencias.',
  },
  {
    titulo: 'Cookies necessarios',
    texto:
      'Usamos cookies necessarios para manter login, seguranca, navegacao e funcionamento basico da plataforma.',
  },
  {
    titulo: 'Cookies de autenticacao',
    texto:
      'Cookies de autenticacao ajudam a reconhecer sua conta enquanto voce usa o NossoZelo. Sem eles, areas protegidas podem nao funcionar.',
  },
  {
    titulo: 'Analytics e terceiros',
    texto:
      'Se ferramentas de medicao ou servicos de terceiros forem ativados, esta pagina deve ser atualizada para explicar quais dados sao usados e como gerenciar consentimento.',
  },
  {
    titulo: 'Como gerenciar',
    texto:
      'Voce pode apagar ou bloquear cookies nas configuracoes do navegador. Alguns recursos podem deixar de funcionar corretamente.',
  },
  {
    titulo: 'Aviso importante',
    texto:
      'Este documento e uma base operacional para MVP e deve ser revisado por assessoria juridica antes do lancamento publico.',
  },
];

export default function PoliticaCookiesPage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />
      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Politica de cookies</p>
            <h1>Como usamos cookies no NossoZelo.</h1>
            <p className={Style.heroText}>
              Entenda quais cookies ajudam a manter sua conta protegida e a
              plataforma funcionando.
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
