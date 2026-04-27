import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';
import { loginService } from '@/service/Login';
import styles from '@/styles/CadastroSocialPage.module.css';

function decodificarTipo(token?: string) {
  if (!token) return '';

  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const dados = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return String(dados?.tipo || '');
  } catch {
    return '';
  }
}

function destinoPorTipo(tipo: string) {
  if (tipo === 'admin') return '/dashboard';
  if (tipo === 'cuidador' || tipo === 'enfermeiro' || tipo === 'acompanhante') {
    return '/perfil';
  }
  return '/prestadores';
}

export default function SocialCallbackPage() {
  const router = useRouter();
  const token =
    typeof router.query.token === 'string' ? router.query.token : '';
  const erro = useMemo(() => {
    if (!router.isReady) return '';
    return token ? '' : 'Token de login social ausente.';
  }, [router.isReady, token]);

  useEffect(() => {
    if (!router.isReady || !token) return;

    loginService.persistirSessao(token);
    router.replace(destinoPorTipo(decodificarTipo(token)));
  }, [router, token]);

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
