import { assinaturaService } from '@/service/assinaturaService';
import api from '@/service/api';
import { PlanoAssinatura, RespostaAssinatura } from '@/types/assinatura';
import { OnboardingStatus } from '@/types/onboarding';

export const onboardingService = {
  obterStatusOnboarding: async () => {
    const response = await api.get<OnboardingStatus>('/onboarding/status');
    return response.data;
  },

  listarPlanos: async (): Promise<PlanoAssinatura[]> =>
    assinaturaService.listarPlanos(),

  iniciarAssinaturaOnboarding: async (
    planoId: number,
  ): Promise<RespostaAssinatura> =>
    assinaturaService.iniciarAssinatura(planoId),
};
