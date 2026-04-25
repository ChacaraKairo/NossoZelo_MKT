"use strict";
/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Definição das rotas de Perfil, centralizando endpoints para visualização
 * de dados próprios, vitrine pública de prestadores e acesso restrito a dados de clientes.
 * @rota server\src\src\route\Route_Perfil
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_Perfil_1 = __importDefault(require("../controller/Controller_Perfil"));
const autenticacao_1 = require("../middleware/autenticacao");
const permitirTipos_1 = require("../middleware/permitirTipos");
console.log('[LOG-FLUXO] Inicializando RoutePerfil e configurando endpoints de acesso a perfis.');
const router = (0, express_1.Router)();
// ==========================================
// GESTÃO DE PERFIS E VITRINE
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: GET /meu -> ControllerPerfil.obterMeuPerfil (Protegida)');
/**
 * Ver o próprio perfil (Telas A e B).
 * Requer autenticação via token JWT.
 */
router.get('/meu', // 🔥 CORRIGIDO: Removido o prefixo /perfil
autenticacao_1.authMiddleware, Controller_Perfil_1.default.obterMeuPerfil);
router.get('/resumo', autenticacao_1.authMiddleware, Controller_Perfil_1.default.obterResumoPerfil);
console.log('[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> ControllerPerfil.vitrinePrestador (Protegida)');
/**
 * Ver vitrine de um prestador (Tela D).
 * Requer autenticação para controle de métricas de visualização.
 */
router.get('/prestador/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
autenticacao_1.authMiddleware, Controller_Perfil_1.default.vitrinePrestador);
console.log('[LOG-FLUXO] Mapeando Rota: GET /cliente/:id -> ControllerPerfil.dadosClienteParaPrestador (Protegida)');
/**
 * Ver dados de um cliente (Tela C - Triagem).
 * Endpoint com lógica de negócio para liberação de contato.
 */
router.get('/cliente/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
autenticacao_1.authMiddleware, (0, permitirTipos_1.permitirTipos)(['cuidador', 'enfermeiro', 'acompanhante']), Controller_Perfil_1.default.dadosClienteParaPrestador);
console.log('[LOG-FLUXO] Mapeando Rota: PATCH /update -> ControllerPerfil.atualizarDadosPerfil (Protegida)');
/**
 * Atualizar o próprio perfil.
 * Rota que estava faltando e causando o erro 404.
 */
router.patch('/update', autenticacao_1.authMiddleware, Controller_Perfil_1.default.atualizarDadosPerfil);
console.log('[LOG-FLUXO] RoutePerfil configurado com sucesso e pronto para o Router Principal.');
exports.default = router;
