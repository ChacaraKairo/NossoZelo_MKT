/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Definição das rotas de Agendamento, centralizando os endpoints para criação,
 * alteração de fluxo (Aceite/Finalização) e Registro Manual de serviços.
 */

import { Router } from 'express';
import AgendamentoController from '../controller/Controller_Agendamentos';
import { authMiddleware } from '../middleware/autenticacao';

console.log(
  '[LOG-FLUXO] Inicializando AgendamentoRouter e configurando endpoints de ciclo de vida de serviço.',
);
const AgendamentoRouter = Router();

// ==========================================
// GESTÃO DE CONTRATAÇÕES E FLUXO
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: POST / -> AgendamentoController.criar (Protegida)',
);
/**
 * Criar um novo agendamento (Status inicial: Pendente).
 * Requer autenticação para vincular o autor da solicitação.
 */
AgendamentoRouter.post(
  '/',
  authMiddleware,
  AgendamentoController.criar as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: PATCH /aceitar/:id -> AgendamentoController.aceitar (Protegida)',
);
/**
 * Aceitar uma contratação (Status: Confirmado).
 * Libera o Privacy Gate para o prestador visualizar os dados de contacto do cliente.
 */
AgendamentoRouter.patch(
  '/aceitar/:id',
  authMiddleware,
  AgendamentoController.aceitar as any,
);

AgendamentoRouter.patch(
  '/cancelar/:id',
  authMiddleware,
  AgendamentoController.cancelar as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: PATCH /finalizar/:id -> AgendamentoController.finalizar (Protegida)',
);
/**
 * Finalizar um serviço (Status: Concluído).
 * Habilita a contratação para receber avaliações de desempenho na Etapa 4.
 */
AgendamentoRouter.patch(
  '/finalizar/:id',
  authMiddleware,
  AgendamentoController.finalizar as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: POST /manual -> AgendamentoController.registroManual (Protegida)',
);
/**
 * Registrar serviço realizado fora da plataforma para fins de métricas de experiência.
 */
AgendamentoRouter.post(
  '/manual',
  authMiddleware,
  AgendamentoController.registroManual as any,
);

// ==========================================
// CONSULTAS HISTÓRICAS E AGENDAS
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> AgendamentoController.listarPorTempo',
);
/**
 * Recupera a agenda cronológica de um prestador.
 */
AgendamentoRouter.get(
  '/prestador/:id',
  authMiddleware,
  AgendamentoController.listarPorTempo as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /cliente/:id -> AgendamentoController.listarPorCliente',
);
/**
 * Recupera o histórico de todas as contratações de um cliente específico.
 */
AgendamentoRouter.get(
  '/cliente/:id',
  authMiddleware,
  AgendamentoController.listarPorCliente as any,
);

console.log(
  '[LOG-FLUXO] AgendamentoRouter configurado com sucesso e árvore de estados operacional.',
);

export default AgendamentoRouter;
