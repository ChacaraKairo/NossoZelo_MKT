import Link from 'next/link';
import HeaderHome from '@/components/header/HeaderHome';
import Footer from '@/components/footer/Footer';
import Style from '@/styles/SobrePage.module.css';
import {
  FaCalendarCheck,
  FaHandshake,
  FaHeart,
  FaLock,
  FaMapMarkerAlt,
  FaUserNurse,
} from 'react-icons/fa';

const pilares = [
  {
    titulo: 'Cuidado com confianca',
    descricao:
      'A NossoZelo aproxima familias de profissionais de cuidado, com uma experiencia pensada para trazer clareza antes, durante e depois da contratacao.',
    icone: <FaHeart />,
  },
  {
    titulo: 'Busca por proximidade',
    descricao:
      'A plataforma usa localizacao e filtros reais para ajudar clientes a encontrarem prestadores mais proximos e alinhados com a necessidade do momento.',
    icone: <FaMapMarkerAlt />,
  },
  {
    titulo: 'Fluxo de agendamento',
    descricao:
      'Clientes podem solicitar atendimento e prestadores podem avaliar, aceitar ou negar pedidos dentro de um fluxo rastreavel.',
    icone: <FaCalendarCheck />,
  },
];

const funcionamento = [
  'O cliente cria sua conta, informa sua localizacao e busca profissionais por categoria, distancia e dados disponiveis.',
  'O prestador completa o perfil profissional com experiencia, disponibilidade, valores, servicos e informacoes relevantes.',
  'A solicitacao de contratacao e enviada pelo cliente e o prestador responde dentro da plataforma.',
  'Dados privados de contato so devem ser liberados quando existir uma contratacao valida entre as partes.',
  'Avaliacoes ajudam a construir reputacao e melhorar a qualidade das escolhas futuras.',
];

const compromissos = [
  {
    titulo: 'Privacidade por padrao',
    texto:
      'Telefone, e-mail e endereco completo nao devem aparecer em vitrines publicas sem autorizacao do fluxo de contratacao.',
    icone: <FaLock />,
  },
  {
    titulo: 'Relacao justa',
    texto:
      'A plataforma foi pensada para dar visibilidade ao prestador e seguranca para quem esta contratando cuidado.',
    icone: <FaHandshake />,
  },
  {
    titulo: 'Profissionais especializados',
    texto:
      'Cuidadores, enfermeiros e acompanhantes possuem areas especificas de perfil para apresentar experiencia e disponibilidade.',
    icone: <FaUserNurse />,
  },
];

export default function SobrePage() {
  return (
    <div className={Style.page}>
      <HeaderHome variant="public" />

      <main>
        <section className={Style.hero}>
          <div className={Style.heroContent}>
            <p className={Style.eyebrow}>Sobre a NossoZelo</p>
            <h1>Cuidado acessivel, organizado e mais humano.</h1>
            <p className={Style.heroText}>
              A NossoZelo nasceu para facilitar a conexao entre pessoas
              que precisam de cuidado e profissionais preparados para
              oferecer apoio com responsabilidade, respeito e proximidade.
            </p>
            <div className={Style.actions}>
              <Link href="/prestadores" className={Style.primaryAction}>
                Buscar prestadores
              </Link>
              <Link href="/cadastro-prestador" className={Style.secondaryAction}>
                Quero ser prestador
              </Link>
            </div>
          </div>
        </section>

        <section className={Style.section}>
          <div className={Style.sectionHeader}>
            <p className={Style.eyebrow}>O projeto</p>
            <h2>Por que a plataforma existe</h2>
            <p>
              Encontrar alguem para cuidar de quem amamos exige
              informacao, confianca e tempo. A NossoZelo organiza essa
              jornada em um ambiente unico, conectando busca, perfil,
              agendamento, contato autorizado e avaliacao.
            </p>
          </div>

          <div className={Style.pillarGrid}>
            {pilares.map((pilar) => (
              <article key={pilar.titulo} className={Style.pillar}>
                <div className={Style.icon}>{pilar.icone}</div>
                <h3>{pilar.titulo}</h3>
                <p>{pilar.descricao}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={Style.band}>
          <div className={Style.bandText}>
            <p className={Style.eyebrow}>Como funciona</p>
            <h2>Uma jornada simples para cliente e prestador</h2>
          </div>
          <ol className={Style.steps}>
            {funcionamento.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className={Style.section}>
          <div className={Style.sectionHeader}>
            <p className={Style.eyebrow}>Compromissos</p>
            <h2>O que guia a NossoZelo</h2>
          </div>

          <div className={Style.commitmentGrid}>
            {compromissos.map((compromisso) => (
              <article
                key={compromisso.titulo}
                className={Style.commitment}
              >
                <div className={Style.icon}>{compromisso.icone}</div>
                <h3>{compromisso.titulo}</h3>
                <p>{compromisso.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={Style.cta}>
          <div>
            <p className={Style.eyebrow}>Nosso proximo passo</p>
            <h2>Construir uma rede de cuidado cada vez mais confiavel.</h2>
            <p>
              A plataforma segue evoluindo para melhorar agendamentos,
              notificacoes, avaliacao de profissionais e seguranca dos
              dados de contato.
            </p>
          </div>
          <Link href="/prestadores" className={Style.primaryAction}>
            Conhecer profissionais
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
