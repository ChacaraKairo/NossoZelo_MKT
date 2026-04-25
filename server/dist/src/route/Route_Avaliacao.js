"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas para o sistema de Prova Social (Ratings),
 * permitindo que clientes avaliem serviços prestados após a conclusão do ciclo de agendamento.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_Avaliacao_1 = __importDefault(require("../controller/Controller_Avaliacao"));
const autenticacao_1 = require("../middleware/autenticacao");
const permitirTipos_1 = require("../middleware/permitirTipos");
console.log('[LOG-FLUXO] Inicializando RouteAvaliacao e configurando endpoints de reputação.');
const router = (0, express_1.Router)();
/**
 * Rota para envio de avaliações de desempenho.
 * O endpoint é protegido por autenticação e possui restrição de unicidade por contratação.
 * Mapeamento: POST /nossozelo/avaliacoes
 */
console.log('[LOG-FLUXO] Mapeando Rota: POST / -> ControllerAvaliacao.registrar (Protegida)');
router.post('/', autenticacao_1.authMiddleware, (0, permitirTipos_1.permitirTipos)(['cliente']), Controller_Avaliacao_1.default.registrar);
console.log('[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> ControllerAvaliacao.listarPorPrestador (Pública)');
// Listar avaliações de um prestador
router.get('/prestador/:id', Controller_Avaliacao_1.default.listarPorPrestador);
console.log('[LOG-FLUXO] RouteAvaliacao configurado com sucesso e pronto para integração ao Router Principal.');
exports.default = router;
