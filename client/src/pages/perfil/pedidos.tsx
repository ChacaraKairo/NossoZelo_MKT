import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';

export default function PerfilPedidosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/perfil?aba=solicitacoes');
  }, [router]);

  return <Carregando mensagem="Abrindo seus pedidos..." />;
}
