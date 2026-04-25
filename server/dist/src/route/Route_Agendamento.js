"use strict";
/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Definição das rotas de Agendamento, centralizando os endpoints para criação,
 * alteração de fluxo (Aceite/Finalização) e Registro Manual de serviços.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_Agendamentos_1 = __importDefault(require("../controller/Controller_Agendamentos"));
const autenticacao_1 = require("../middleware/autenticacao");
console.log('[LOG-FLUXO] Inicializando AgendamentoRouter e configurando endpoints de ciclo de vida de serviço.');
const AgendamentoRouter = (0, express_1.Router)();
// ==========================================
// GESTÃO DE CONTRATAÇÕES E FLUXO
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: POST / -> AgendamentoController.criar (Protegida)');
/**
 * Criar um novo agendamento (Status inicial: Pendente).
 * Requer autenticação para vincular o autor da solicitação.
 */
AgendamentoRouter.post('/', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.criar);
console.log('[LOG-FLUXO] Mapeando Rota: PATCH /aceitar/:id -> AgendamentoController.aceitar (Protegida)');
/**
 * Aceitar uma contratação (Status: Confirmado).
 * Libera o Privacy Gate para o prestador visualizar os dados de contacto do cliente.
 */
AgendamentoRouter.patch('/aceitar/:id', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.aceitar);
console.log('[LOG-FLUXO] Mapeando Rota: PATCH /finalizar/:id -> AgendamentoController.finalizar (Protegida)');
/**
 * Finalizar um serviço (Status: Concluído).
 * Habilita a contratação para receber avaliações de desempenho na Etapa 4.
 */
AgendamentoRouter.patch('/finalizar/:id', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.finalizar);
console.log('[LOG-FLUXO] Mapeando Rota: POST /manual -> AgendamentoController.registroManual (Protegida)');
/**
 * Registrar serviço realizado fora da plataforma para fins de métricas de experiência.
 */
AgendamentoRouter.post('/manual', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.registroManual);
// ==========================================
// CONSULTAS HISTÓRICAS E AGENDAS
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> AgendamentoController.listarPorTempo');
/**
 * Recupera a agenda cronológica de um prestador.
 */
AgendamentoRouter.get('/prestador/:id', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.listarPorTempo);
console.log('[LOG-FLUXO] Mapeando Rota: GET /cliente/:id -> AgendamentoController.listarPorCliente');
/**
 * Recupera o histórico de todas as contratações de um cliente específico.
 */
AgendamentoRouter.get('/cliente/:id', autenticacao_1.authMiddleware, Controller_Agendamentos_1.default.listarPorCliente);
console.log('[LOG-FLUXO] AgendamentoRouter configurado com sucesso e árvore de estados operacional.');
exports.default = AgendamentoRouter;
