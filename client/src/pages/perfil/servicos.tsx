import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';

export default function PerfilServicosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil?aba=servicos');
  }, [router]);

  return <Carregando mensagem="Abrindo seus serviços..." />;
}
