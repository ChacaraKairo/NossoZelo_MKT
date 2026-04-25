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
import { permitirTipos } from '../middleware/permitirTipos';

console.log(
  '[LOG-FLUXO] Inicializando RouteAvaliacao e configurando endpoints de reputação.',
);
const router = Router();

/**
 * Rota para envio de avaliações de desempenho.
 * O endpoint é protegido por autenticação e possui restrição de unicidade por contratação.
 * Mapeamento: POST /nossozelo/avaliacoes
 */
console.log(
  '[LOG-FLUXO] Mapeando Rota: POST / -> ControllerAvaliacao.registrar (Protegida)',
);
router.post(
  '/',
  authMiddleware,
  permitirTipos(['cliente']),
  ControllerAvaliacao.registrar as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> ControllerAvaliacao.listarPorPrestador (Pública)',
);
// Listar avaliações de um prestador
router.get(
  '/prestador/:id',
  ControllerAvaliacao.listarPorPrestador,
);

console.log(
  '[LOG-FLUXO] RouteAvaliacao configurado com sucesso e pronto para integração ao Router Principal.',
);

export default router;
