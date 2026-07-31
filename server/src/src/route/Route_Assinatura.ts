import { Router } from 'express';
import ControllerAssinatura from '../controller/Controller_Assinatura';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';
import { validarEntrada } from '../middleware/validacaoEntrada';
import {
  assinaturaSchema,
  webhookAsaasSchema,
} from '../validator/schemas/rotasSensiveis';
import { TIPOS_PRESTADOR } from '../constants/dominio';

const AssinaturaRouter = Router();

AssinaturaRouter.post(
  '/webhook/asaas',
  validarEntrada(webhookAsaasSchema),
  ControllerAssinatura.webhookAsaas as any,
);

AssinaturaRouter.get(
  '/planos',
  authMiddleware,
  ControllerAssinatura.planos as any,
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
  permitirTipos(TIPOS_PRESTADOR),
  validarEntrada(assinaturaSchema),
  ControllerAssinatura.iniciar as any,
);

AssinaturaRouter.post(
  '/regularizar',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  validarEntrada(assinaturaSchema),
  ControllerAssinatura.regularizar as any,
);

AssinaturaRouter.post(
  '/cancelar',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  ControllerAssinatura.cancelar as any,
);

AssinaturaRouter.post(
  '/expirar-pendentes',
  authMiddleware,
  ControllerAssinatura.expirarPendentes as any,
);

export default AssinaturaRouter;
