/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de Agendamento, centralizando os endpoints para criação
 * de novas contratações e consulta histórica de agendas tanto para prestadores quanto para clientes.
 * @rota server\src\src\route\Route_Agendamento
 */

import { Router } from 'express';
import AgendamentoController from '../controller/Controller_Agendamentos';

console.log(
  '[LOG-FLUXO] Inicializando AgendamentoRouter e configurando endpoints de agenda.',
);
const AgendamentoRouter = Router();

// ==========================================
// GESTÃO DE CONTRATAÇÕES E AGENDAS
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: POST /agendamentos -> AgendamentoController.criar',
);
/**
 * Criar um novo agendamento (agenda + contratação).
 * Recebe o payload completo da contratação e aciona o gatilho de agenda no banco.
 */
AgendamentoRouter.post(
  '/agendamentos',
  AgendamentoController.criar,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /agendamentos/prestador/:id -> AgendamentoController.listarPorTempo',
);
/**
 * Listar agendamentos de um prestador por tempo.
 * Exemplo: /agendamentos/prestador/USR456?dias=7
 * Permite a visualização cronológica das atividades do prestador.
 */
AgendamentoRouter.get(
  '/agendamentos/prestador/:id',
  AgendamentoController.listarPorTempo,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /agendamentos/cliente/:id -> AgendamentoController.listarPorCliente',
);
/**
 * Listar agendamentos de um cliente.
 * Exemplo: /agendamentos/cliente/USR123
 * Retorna o histórico de todas as contratações solicitadas pelo usuário cliente.
 */
AgendamentoRouter.get(
  '/agendamentos/cliente/:id',
  AgendamentoController.listarPorCliente,
);

console.log(
  '[LOG-FLUXO] AgendamentoRouter configurado com sucesso e pronto para acoplamento principal.',
);

export default AgendamentoRouter;
