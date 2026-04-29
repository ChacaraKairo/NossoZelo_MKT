/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas para o sistema de Prova Social (Ratings),
 * permitindo que clientes avaliem serviços prestados após a conclusão do ciclo de agendamento.
 */

import { Router } from 'express';
import ControllerAvaliacao from '../controller/Controller_Avaliacao';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';const router = Router();router.post(
  '/',
  authMiddleware,
  permitirTipos(['cliente']),
  ControllerAvaliacao.registrar as any,
);// Listar avaliações de um prestador
router.get(
  '/prestador/:id',
  ControllerAvaliacao.listarPorPrestador,
);export default router;
