"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas da entidade Usuário, centralizando os endpoints de
 * cadastro unificado, gerenciamento de perfil, atualização de credenciais e exclusão de registros.
 * @rota server\src\src\route\Route_User
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_User_1 = __importDefault(require("../controller/Controller_User"));
console.log('[LOG-FLUXO] Inicializando UserRouter e configurando endpoints de usuários.');
const UserRouter = (0, express_1.Router)();
// ==========================================
// 1. ROTA DE CRIAÇÃO (UNIFICADA)
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: POST /usuario -> UserController.criarUsuario');
/**
 * Esta única rota agora substitui as antigas /cuidador, /enfermeiro e /admin.
 * O UserController.criarUsuario lê o "req.body.usuario.tipo" e roteia automaticamente.
 */
UserRouter.post('/usuario', Controller_User_1.default.criarUsuario);
// ==========================================
// 2. ROTAS DE LEITURA E ATUALIZAÇÃO
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: GET /usuario/:id -> UserController.buscarUsuarioCompleto');
UserRouter.get('/usuario/:id', Controller_User_1.default.buscarUsuarioCompleto);
console.log('[LOG-FLUXO] Mapeando Rota: PUT /usuario/:id -> UserController.atualizarUsuario');
UserRouter.put('/usuario/:id', Controller_User_1.default.atualizarUsuario);
console.log('[LOG-FLUXO] Mapeando Rota: PUT /usuario/:id/senha -> UserController.atualizarSenha');
UserRouter.put('/usuario/:id/senha', Controller_User_1.default.atualizarSenha);
// ==========================================
// 3. ROTAS DE DELEÇÃO
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: DELETE /usuario/:id -> UserController.deletarUsuario');
UserRouter.delete('/usuario/:id', Controller_User_1.default.deletarUsuario);
console.log('[LOG-FLUXO] UserRouter configurado com sucesso e pronto para acoplamento no Router Principal.');
exports.default = UserRouter;
