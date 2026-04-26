import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import Carregando from '@/components/common/Carregando';
import ErroComRetry from '@/components/common/ErroComRetry';
import EstadoVazio from '@/components/common/EstadoVazio';
import AlertaPerfilIncompleto from '@/components/perfil/AlertaPerfilIncompleto';
import AbaAgendaPro from '@/components/perfil/AbaAgendaPro';
import AbaAvaliacoesPro from '@/components/perfil/AbaAvaliacoesPro';
import { useMeuPerfil } from '@/hooks/useMeuPerfil';
import { ContratacaoPerfil } from '@/types/perfil';
import { withAuth } from '@/utils/withAuth';
import logger from '@/utils/logger';
import styles from '@/styles/DashboardPage.module.css';

const CONTEXTO = 'DashboardPage';

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string | number;
}) {
  return (
    <div className={styles.summaryCard}>
      <p className={styles.summaryLabel}>{titulo}</p>
      <p className={styles.summaryValue}>{valor}</p>
    </div>
  );
}

function ListaContratacoes({
  contratacoes,
}: {
  contratacoes: ContratacaoPerfil[];
}) {
  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma contratação recente."
        descricao="Quando houver contratações reais, elas aparecerão aqui."
      />
    );
  }

  return (
    <div className={styles.list}>
      {contratacoes.slice(0, 5).map((contratacao) => (
        <article
          key={contratacao.id}
          className={styles.recentCard}
        >
          <p className={styles.recentTitle}>
            Contratação #{contratacao.id}
          </p>
          <p className={styles.recentMeta}>
            Status: {contratacao.status || 'Não informado'}
          </p>
        </article>
      ))}
    </div>
  );
}

function DashboardPage() {
  const router = useRouter();
  const {
    perfil,
    loading,
    error,
    recarregarPerfil,
    isCliente,
    isPrestador,
    tipoUsuario,
  } = useMeuPerfil();

  useEffect(() => {
    logger.info(CONTEXTO, 'Carregamento do dashboard');
  }, []);

  useEffect(() => {
    if (!tipoUsuario) return;
    logger.info(CONTEXTO, 'Tipo detectado', { tipoUsuario });
  }, [tipoUsuario]);

  if (loading) {
    return (
      <div className={styles.page}>
        <HeaderMain />
        <main className={styles.main}>
          <Carregando mensagem="Carregando dashboard..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !perfil) {
    logger.error(CONTEXTO, 'Erros no dashboard', { error });
    return (
      <div className={styles.page}>
        <HeaderMain />
        <main className={styles.main}>
          <ErroComRetry
            titulo="Não foi possível carregar o dashboard"
            mensagem="Tente novamente para buscar seus dados atualizados."
            detalhes={error || 'Perfil não encontrado.'}
            onRetry={recarregarPerfil}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const contratacoesCliente =
    perfil.contratacoes_contratacoes_cliente_idTousuarios ||
    perfil.contratacoes ||
    [];
  const contratacoesPrestador =
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    [];
  const pendentes = contratacoesPrestador.filter(
    (contratacao) => contratacao.status === 'pendente',
  );

  if (isPrestador) {
    logger.info(CONTEXTO, 'Blocos renderizados', {
      tipo: 'prestador',
      pendentes: pendentes.length,
    });
  }

  if (isCliente) {
    logger.info(CONTEXTO, 'Blocos renderizados', {
      tipo: 'cliente',
      contratacoes: contratacoesCliente.length,
    });
  }

  return (
    <div className={styles.page}>
      <HeaderMain />
      <main className={styles.main}>
        <header>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Dados carregados do seu perfil real.
          </p>
        </header>

        {isCliente && (
          <>
            <section className={styles.summaryGrid}>
              <Link
                href="/prestadores"
                className={styles.quickLink}
              >
                Buscar prestadores
              </Link>
              <CardResumo
                titulo="Contratações"
                valor={contratacoesCliente.length}
              />
              <CardResumo titulo="Avaliações pendentes" valor="-" />
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Contratações recentes
              </h2>
              <ListaContratacoes contratacoes={contratacoesCliente} />
            </section>
          </>
        )}

        {isPrestador && (
          <>
            <AlertaPerfilIncompleto
              perfil={perfil}
              tipoUsuario={tipoUsuario}
              onCompletarPerfil={() => {
                logger.info(CONTEXTO, 'Clique no alerta do dashboard');
                router.push('/perfil');
              }}
            />

            <section className={styles.pendingAlert}>
              <div className={styles.pendingContent}>
                <div>
                  <h2 className={styles.pendingTitle}>
                    Solicitações pendentes
                    <span className={styles.badge}>
                      {pendentes.length}
                    </span>
                  </h2>
                  <p className={styles.pendingText}>
                    Telegram/email devem ser disparados no backend após mudança de status da contratação.
                  </p>
                </div>
                <Link
                  href="/perfil?aba=solicitacoes"
                  onClick={() =>
                    logger.info(CONTEXTO, 'Clique no alerta', {
                      pendentes: pendentes.length,
                    })
                  }
                  className={styles.pendingLink}
                >
                  Ver solicitações
                </Link>
              </div>
            </section>

            <section className={styles.summaryGrid}>
              <CardResumo titulo="Pendentes" valor={pendentes.length} />
              <CardResumo
                titulo="Contratações"
                valor={contratacoesPrestador.length}
              />
              <CardResumo
                titulo="Avaliação média"
                valor={perfil.avaliacao_media || 'Não informado'}
              />
            </section>

            <AbaAgendaPro perfil={perfil} />
            <AbaAvaliacoesPro perfil={perfil} />
          </>
        )}

        {!isCliente && !isPrestador && (
          <EstadoVazio
            titulo="Tipo de usuário não reconhecido."
            descricao="Não foi possível decidir quais blocos do dashboard exibir."
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default withAuth(DashboardPage);
