import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { onboardingService } from '@/service/onboardingService';

const ROTAS_LIVRES = new Set([
  '/onboarding/prestador',
  '/confirmar-email',
  '/assinatura',
  '/prestadores',
]);

export function useOnboardingGuard(ativo = true) {
  const router = useRouter();

  useEffect(() => {
    if (!ativo || !router.isReady || ROTAS_LIVRES.has(router.pathname)) return;

    let cancelado = false;
    onboardingService
      .obterStatusOnboarding()
      .then((status) => {
        if (cancelado) return;
        if (status.isPrestador && status.etapaAtual !== 'ativo') {
          router.replace('/onboarding/prestador');
        }
      })
      .catch(() => undefined);

    return () => {
      cancelado = true;
    };
  }, [ativo, router]);
}
