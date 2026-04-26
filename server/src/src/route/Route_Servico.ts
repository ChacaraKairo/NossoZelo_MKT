import { Router } from 'express';
import ControllerServico from '../controller/Controller_Servico';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';
import { TIPOS_PRESTADOR } from '../constants/dominio';

const ServicoRouter = Router();

ServicoRouter.get(
  '/meus',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  ControllerServico.listarMeus as any,
);

ServicoRouter.post(
  '/',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  ControllerServico.criar as any,
);

ServicoRouter.patch(
  '/:id',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  ControllerServico.atualizar as any,
);

ServicoRouter.delete(
  '/:id',
  authMiddleware,
  permitirTipos(TIPOS_PRESTADOR),
  ControllerServico.remover as any,
);

export default ServicoRouter;
