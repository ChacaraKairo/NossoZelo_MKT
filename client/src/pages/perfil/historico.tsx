import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';

export default function PerfilHistoricoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil?aba=historico');
  }, [router]);

  return <Carregando mensagem="Abrindo seu histórico..." />;
}
