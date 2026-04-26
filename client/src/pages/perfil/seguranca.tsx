import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';

export default function PerfilSegurancaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil?aba=seguranca');
  }, [router]);

  return <Carregando mensagem="Abrindo segurança da conta..." />;
}
