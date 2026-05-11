/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Definição das rotas de Agendamento, centralizando os endpoints para criação,
 * alteração de fluxo (Aceite/Finalização) e Registro Manual de serviços.
 */

import { Router } from 'express';
import AgendamentoController from '../controller/Controller_Agendamentos';
import { authMiddleware } from '../middleware/autenticacao';const AgendamentoRouter = Router();/**
 * Criar um novo agendamento (Status inicial: Pendente).
 * Requer autenticação para vincular o autor da solicitação.
 */
AgendamentoRouter.post(
  '/',
  authMiddleware,
  AgendamentoController.criar as any,
);/**
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
);/**
 * Marcar atendimento confirmado como nao realizado apos o horario de inicio.
 */
AgendamentoRouter.patch(
  '/nao-realizado/:id',
  authMiddleware,
  AgendamentoController.naoRealizado as any,
);/**
 * Finalizar um serviço (Status: Concluído).
 * Habilita a contratação para receber avaliações de desempenho na Etapa 4.
 */
AgendamentoRouter.patch(
  '/finalizar/:id',
  authMiddleware,
  AgendamentoController.finalizar as any,
);/**
 * Registrar serviço realizado fora da plataforma para fins de métricas de experiência.
 */
AgendamentoRouter.post(
  '/manual',
  authMiddleware,
  AgendamentoController.registroManual as any,
);/**
 * Recupera a agenda cronológica de um prestador.
 */
AgendamentoRouter.get(
  '/prestador/:id',
  authMiddleware,
  AgendamentoController.listarPorTempo as any,
);/**
 * Recupera o histórico de todas as contratações de um cliente específico.
 */
AgendamentoRouter.get(
  '/cliente/:id',
  authMiddleware,
  AgendamentoController.listarPorCliente as any,
);export default AgendamentoRouter;
