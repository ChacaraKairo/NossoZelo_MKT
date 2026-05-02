import { Router } from 'express';
import ControllerConfirmacaoEmail from '../controller/Controller_ConfirmacaoEmail';
import { authMiddleware } from '../middleware/autenticacao';
import { rateLimit } from '../middleware/rateLimit';

const ConfirmacaoEmailRouter = Router();
const confirmarEmailRateLimit = rateLimit({
  nome: 'confirmacao_email',
  janelaMs: 15 * 60 * 1000,
  max: 20,
});

ConfirmacaoEmailRouter.get(
  '/confirmar',
  confirmarEmailRateLimit,
  ControllerConfirmacaoEmail.confirmar as any,
);

ConfirmacaoEmailRouter.post(
  '/confirmar',
  confirmarEmailRateLimit,
  ControllerConfirmacaoEmail.confirmar as any,
);

ConfirmacaoEmailRouter.post(
  '/reenviar-confirmacao',
  confirmarEmailRateLimit,
  authMiddleware,
  ControllerConfirmacaoEmail.reenviar as any,
);

ConfirmacaoEmailRouter.get(
  '/status',
  authMiddleware,
  ControllerConfirmacaoEmail.status as any,
);

export default ConfirmacaoEmailRouter;
