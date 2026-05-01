import { Router } from 'express';
import ControllerAssinatura from '../controller/Controller_Assinatura';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';

const AssinaturaRouter = Router();
const tiposPrestador = ['cuidador', 'enfermeiro', 'acompanhante'];

AssinaturaRouter.post(
  '/webhook/asaas',
  ControllerAssinatura.webhookAsaas as any,
);

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
  '/iniciar',
  authMiddleware,
  permitirTipos(tiposPrestador),
  ControllerAssinatura.iniciar as any,
);

AssinaturaRouter.post(
  '/regularizar',
  authMiddleware,
  permitirTipos(tiposPrestador),
  ControllerAssinatura.regularizar as any,
);

AssinaturaRouter.post(
  '/cancelar',
  authMiddleware,
  permitirTipos(tiposPrestador),
  ControllerAssinatura.cancelar as any,
);

AssinaturaRouter.post(
  '/expirar-pendentes',
  authMiddleware,
  ControllerAssinatura.expirarPendentes as any,
);

export default AssinaturaRouter;
