import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';
import { loginService } from '@/service/Login';
import { onboardingService } from '@/service/onboardingService';
import styles from '@/styles/CadastroSocialPage.module.css';

function destinoPorTipo(tipo: string) {
  if (tipo === 'admin') return '/dashboard';
  if (tipo === 'cuidador' || tipo === 'enfermeiro' || tipo === 'acompanhante') {
    return '/perfil';
  }
  return '/prestadores';
}

export default function SocialCallbackPage() {
  const router = useRouter();
  const status =
    typeof router.query.status === 'string' ? router.query.status : '';
  const erro = useMemo(() => {
    if (!router.isReady) return '';
    return status === 'success' ? '' : 'Login social nao concluido.';
  }, [router.isReady, status]);

  useEffect(() => {
    if (!router.isReady || status !== 'success') return;

    loginService
      .me()
      .then((sessao) =>
        onboardingService.obterStatusOnboarding().then((onboarding) => ({
          sessao,
          onboarding,
        })),
      )
      .then(({ sessao, onboarding }) => {
        const usuario = sessao.user || sessao.usuario;
        if (onboarding.isPrestador && onboarding.etapaAtual !== 'ativo') {
          router.replace('/onboarding/prestador');
          return;
        }
        router.replace(destinoPorTipo(usuario?.tipo || 'cliente'));
      })
      .catch(() => router.replace('/login-user'));
  }, [router, status]);

  if (erro) {
    return (
      <main className={styles.page}>
        <section className={styles.errorCard}>
          <h1>Login social incompleto</h1>
          <p>{erro} Inicie o login novamente.</p>
          <Link className={styles.backLink} href="/login-user">
            Voltar ao login
          </Link>
        </section>
      </main>
    );
  }

  return <Carregando mensagem="Concluindo login social..." />;
}
