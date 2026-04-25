"use strict";
/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Ponto central de roteamento da API Nosso Zelo, responsável por orquestrar
 * e unificar os sub-roteadores especializados em um único ponto de entrada para a aplicação Express.
 * @rota server\src\src\route\index.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Route_User_1 = __importDefault(require("./Route_User"));
const Route_Crud_1 = __importDefault(require("./Route_Crud"));
const Route_Login_1 = __importDefault(require("./Route_Login"));
const Route_Localizacao_1 = __importDefault(require("./Route_Localizacao"));
const Route_Agendamento_1 = __importDefault(require("./Route_Agendamento"));
const Route_Upload_1 = __importDefault(require("./Route_Upload"));
const Route_Perfil_1 = __importDefault(require("./Route_Perfil"));
const Route_Avaliacao_1 = __importDefault(require("./Route_Avaliacao"));
console.log('[LOG-FLUXO] Inicializando roteador central (index) e iniciando acoplamento de módulos.');
const router = (0, express_1.Router)();
// ==========================================
// REGISTRO DE MÓDULOS DE ROTA
// ==========================================
console.log('[LOG-FLUXO] Acoplando módulo: /create-users -> UserRouter');
/**
 * Rota para criação e gerenciamento básico de usuários.
 */
router.use('/create-users', Route_User_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /crud -> CrudRouter');
/**
 * Rota para operações CRUD genéricas em múltiplas entidades.
 */
router.use('/crud', Route_Crud_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /login -> LoginRouter');
/**
 * Rota para processos de autenticação e identidade.
 */
router.use('/login', Route_Login_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /geolocalizacao -> LocalizacaoRouter');
/**
 * Rota para serviços geográficos, busca de CEP e proximidade.
 */
router.use('/geolocalizacao', Route_Localizacao_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /agendamentos -> AgendamentoRouter');
/**
 * Rota para gestão de contratações e agendas de serviços.
 */
router.use('/agendamentos', Route_Agendamento_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /upload -> UploadRouter');
/**
 * Rota para gerenciamento de upload de arquivos e documentos.
 */
router.use('/upload', Route_Upload_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /perfil -> PerfilRouter');
/**
 * Rota para gerenciamento e vitrine de perfis.
 */
router.use('/perfil', Route_Perfil_1.default);
console.log('[LOG-FLUXO] Acoplando módulo: /avaliacoes -> AvaliacaoRouter');
/**
 * Rota para sistema de avaliações cruzadas e gestão de reputação.
 */
router.use('/avaliacoes', Route_Avaliacao_1.default);
console.log('[LOG-FLUXO] Roteamento central configurado com sucesso. Árvore de endpoints operacional.');
exports.default = router;
