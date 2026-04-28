import { Router } from 'express';
import ControllerConfirmacaoEmail from '../controller/Controller_ConfirmacaoEmail';
import { authMiddleware } from '../middleware/autenticacao';

const ConfirmacaoEmailRouter = Router();

ConfirmacaoEmailRouter.get(
  '/confirmar',
  ControllerConfirmacaoEmail.confirmar as any,
);

ConfirmacaoEmailRouter.post(
  '/reenviar-confirmacao',
  authMiddleware,
  ControllerConfirmacaoEmail.reenviar as any,
);

ConfirmacaoEmailRouter.get(
  '/status',
  authMiddleware,
  ControllerConfirmacaoEmail.status as any,
);

export default ConfirmacaoEmailRouter;
