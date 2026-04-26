import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';

export default function PerfilAgendaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil?aba=agenda');
  }, [router]);

  return <Carregando mensagem="Abrindo sua agenda..." />;
}
