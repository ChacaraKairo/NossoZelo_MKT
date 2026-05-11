import { Router } from 'express';
import ControllerAvaliacao from '../controller/Controller_Avaliacao';
import { authMiddleware } from '../middleware/autenticacao';

const router = Router();

router.post(
  '/',
  authMiddleware,
  ControllerAvaliacao.registrar as any,
);

router.get(
  '/minhas-pendentes',
  authMiddleware,
  ControllerAvaliacao.minhasPendentes as any,
);

router.get(
  '/contratacao/:id/disponibilidade',
  authMiddleware,
  ControllerAvaliacao.disponibilidade as any,
);

router.get(
  '/disponibilidade/:contratacaoId',
  authMiddleware,
  ControllerAvaliacao.disponibilidade as any,
);

router.get(
  '/prestador/:id',
  ControllerAvaliacao.listarPorPrestador,
);

router.get(
  '/cliente/:id',
  ControllerAvaliacao.listarPorCliente,
);

export default router;
