import { Router } from 'express';
import ControllerOnboarding from '../controller/Controller_Onboarding';
import { authMiddleware } from '../middleware/autenticacao';

const OnboardingRouter = Router();

OnboardingRouter.get(
  '/status',
  authMiddleware,
  ControllerOnboarding.status as any,
);

export default OnboardingRouter;
