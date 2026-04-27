import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';
import { loginService } from '@/service/Login';

export default function SocialCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const token = router.query.token;
    if (typeof token !== 'string') return;

    loginService.persistirSessao(token);
    router.replace('/prestadores');
  }, [router]);

  return <Carregando mensagem="Concluindo login social..." />;
}
