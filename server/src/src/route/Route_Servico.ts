import { Router } from 'express';
import ControllerServico from '../controller/Controller_Servico';
import { authMiddleware } from '../middleware/autenticacao';

const ServicoRouter = Router();

ServicoRouter.get(
  '/meus',
  authMiddleware,
  ControllerServico.listarMeus as any,
);

ServicoRouter.post(
  '/',
  authMiddleware,
  ControllerServico.criar as any,
);

ServicoRouter.patch(
  '/:id',
  authMiddleware,
  ControllerServico.atualizar as any,
);

ServicoRouter.delete(
  '/:id',
  authMiddleware,
  ControllerServico.remover as any,
);

export default ServicoRouter;
