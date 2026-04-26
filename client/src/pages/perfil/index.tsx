import { useEffect } from 'react';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import Carregando from '@/components/common/Carregando';
import ErroComRetry from '@/components/common/ErroComRetry';
import PerfilCliente from '@/components/perfil/PerfilCliente';
import PerfilPrestador from '@/components/perfil/PerfilPrestador';
import { useMeuPerfil } from '@/hooks/useMeuPerfil';
import { withAuth } from '@/utils/withAuth';
import logger from '@/utils/logger';
import styles from '@/styles/Perfil.module.css';

const CONTEXTO = 'PerfilPage';

function LoadingPerfil() {
  return (
    <div className={styles.container}>
      <HeaderMain />
      <main className={styles.mainContent}>
        <Carregando mensagem="Carregando seu perfil..." />
      </main>
      <Footer />
    </div>
  );
}

function PerfilPage() {
  const router = useRouter();
  const {
    perfil,
    loading,
    error,
    recarregarPerfil,
    definirPerfil,
    isCliente,
    isPrestador,
    tipoUsuario,
  } = useMeuPerfil();

  useEffect(() => {
    logger.info(CONTEXTO, 'Página de perfil montada');
  }, []);

  useEffect(() => {
    if (!tipoUsuario) return;

    logger.info(CONTEXTO, 'Tipo de usuário detectado', {
      tipoUsuario,
    });
  }, [tipoUsuario]);

  useEffect(() => {
    if (!error) return;

    logger.error(CONTEXTO, 'Falha de carregamento do perfil', {
      error,
    });
  }, [error]);

  if (loading) {
    logger.debug(CONTEXTO, 'Renderizando estado de loading');
    return <LoadingPerfil />;
  }

  if (error) {
    logger.warn(CONTEXTO, 'Renderizando erro com retry', {
      error,
    });

    return (
      <div className={styles.container}>
        <HeaderMain />
        <main className={styles.mainContent}>
          <ErroComRetry
            titulo="Não foi possível carregar seu perfil"
            mensagem="Tente novamente para buscar seus dados atualizados."
            detalhes={error}
            onRetry={recarregarPerfil}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!perfil) {
    logger.warn(
      CONTEXTO,
      'Perfil ausente após carregamento concluído',
    );

    return (
      <div className={styles.container}>
        <HeaderMain />
        <main className={styles.mainContent}>
          <div className={styles.card}>
            <h1 className={styles.emptyTitle}>
              Perfil não encontrado
            </h1>
            <p className={styles.emptyText}>
              Não recebemos dados suficientes para renderizar sua
              tela de perfil.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  let conteudo;

  if (isCliente) {
    logger.info(CONTEXTO, 'Renderização escolhida', {
      componente: 'PerfilCliente',
    });
    conteudo = (
      <PerfilCliente
        perfil={perfil}
        onPerfilAtualizado={definirPerfil}
        abaInicial={
          typeof router.query.aba === 'string'
            ? router.query.aba
            : undefined
        }
      />
    );
  } else if (isPrestador) {
    logger.info(CONTEXTO, 'Renderização escolhida', {
      componente: 'PerfilPrestador',
    });
    conteudo = (
      <PerfilPrestador
        perfil={perfil}
        onPerfilAtualizado={definirPerfil}
        abaInicial={
          typeof router.query.aba === 'string'
            ? router.query.aba
            : undefined
        }
        onRecarregarPerfil={recarregarPerfil}
      />
    );
  } else {
    logger.warn(CONTEXTO, 'Tipo de usuário desconhecido', {
      tipoUsuario,
    });
    conteudo = (
      <section className={styles.card}>
        <h1 className={styles.emptyTitle}>
          Tipo de perfil não reconhecido
        </h1>
        <p className={styles.emptyText}>
          Não foi possível decidir qual tela exibir para o tipo{' '}
          <strong>{tipoUsuario || 'Não informado'}</strong>.
        </p>
      </section>
    );
  }

  return (
    <div className={styles.container}>
      <HeaderMain />
      <main className={styles.mainContent}>
        <div className={styles.card}>{conteudo}</div>
      </main>
      <Footer />
    </div>
  );
}

export default withAuth(PerfilPage);
