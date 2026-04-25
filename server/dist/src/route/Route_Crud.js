"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas genéricas de CRUD, permitindo a manipulação dinâmica
 * de diversas entidades do sistema através de mapeamento automático para o CrudController.
 * @rota server\src\src\route\Route_Crud
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_Crud_1 = __importDefault(require("../controller/Controller_Crud"));
console.log('[LOG-FLUXO] Inicializando CrudRouter para gestão dinâmica de entidades do banco de dados.');
const CrudRouter = (0, express_1.Router)();
// ==========================================
// OPERAÇÕES DE CONSULTA (READ)
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: GET /entities -> CrudController.listarEntidades');
/**
 * Lista todas as tabelas/entidades configuradas no sistema.
 */
CrudRouter.get('/entities', Controller_Crud_1.default.listarEntidades);
console.log('[LOG-FLUXO] Mapeando Rota: GET /:entity -> CrudController.listarTodos');
/**
 * Retorna todos os registros de uma entidade específica.
 */
CrudRouter.get('/:entity', Controller_Crud_1.default.listarTodos);
console.log('[LOG-FLUXO] Mapeando Rota: GET /:entity/:id -> CrudController.buscarPorId');
/**
 * Busca um registro único pelo seu identificador primário.
 */
CrudRouter.get('/:entity/:id', Controller_Crud_1.default.buscarPorId);
console.log('[LOG-FLUXO] Mapeando Rota: GET /:entity/:field/:value -> CrudController.buscarPorCampo');
/**
 * Filtra registros baseados em um par campo/valor dinâmico.
 */
CrudRouter.get('/:entity/:field/:value', Controller_Crud_1.default.buscarPorCampo);
// ==========================================
// OPERAÇÕES DE CRIAÇÃO (CREATE)
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: POST /:entity -> CrudController.criarRegistro');
/**
 * Cria um novo registro na entidade especificada.
 */
CrudRouter.post('/:entity', Controller_Crud_1.default.criarRegistro);
console.log('[LOG-FLUXO] Mapeando Rota: POST /:entity/many -> CrudController.criarMultiplos');
/**
 * Realiza inserção em lote (Batch Insert) para uma entidade.
 */
CrudRouter.post('/:entity/many', Controller_Crud_1.default.criarMultiplos);
// ==========================================
// OPERAÇÕES DE EDIÇÃO E REMOÇÃO (UPDATE/DELETE)
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: PUT /:entity/:id -> CrudController.atualizarRegistro');
/**
 * Atualiza um registro existente via ID.
 */
CrudRouter.put('/:entity/:id', Controller_Crud_1.default.atualizarRegistro);
console.log('[LOG-FLUXO] Mapeando Rota: DELETE /:entity/:id -> CrudController.deletarRegistro');
/**
 * Remove fisicamente um registro da base de dados.
 */
CrudRouter.delete('/:entity/:id', Controller_Crud_1.default.deletarRegistro);
console.log('[LOG-FLUXO] CrudRouter configurado com sucesso e pronto para acoplamento principal.');
exports.default = CrudRouter;
