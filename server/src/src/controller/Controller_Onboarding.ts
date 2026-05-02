import { Response } from 'express';
import ServiceOnboarding from '../service/Service_Onboarding';
import { AuthRequest } from '../types/auth';

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

class ControllerOnboarding {
  async status(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const status = await ServiceOnboarding.obterStatus(req.user.id);
      return res.status(200).json(status);
    } catch (error: any) {
      return res.status(statusErro(error)).json({ error: error.message });
    }
  }
}

export default new ControllerOnboarding();
