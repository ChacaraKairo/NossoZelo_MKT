import { Router } from 'express';
import ControllerAssinatura from '../controller/Controller_Assinatura';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';

const AssinaturaRouter = Router();
const tiposPrestador = ['cuidador', 'enfermeiro', 'acompanhante'];

AssinaturaRouter.get(
  '/minha',
  authMiddleware,
  ControllerAssinatura.minha as any,
);

AssinaturaRouter.get(
  '/status/:prestadorId',
  authMiddleware,
  ControllerAssinatura.status as any,
);

AssinaturaRouter.post(
  '/iniciar-mock',
  authMiddleware,
  permitirTipos(tiposPrestador),
  ControllerAssinatura.iniciarMock as any,
);

AssinaturaRouter.post(
  '/regularizar-mock',
  authMiddleware,
  permitirTipos(tiposPrestador),
  ControllerAssinatura.regularizarMock as any,
);

AssinaturaRouter.post(
  '/expirar-pendentes',
  authMiddleware,
  ControllerAssinatura.expirarPendentes as any,
);

export default AssinaturaRouter;
