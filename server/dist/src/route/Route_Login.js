"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de Autenticação, centralizando os endpoints de
 * validação de credenciais (Login) e acesso público ao sistema.
 * @rota server\src\src\route\Route_Login
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Controller_Login_1 = require("../controller/Controller_Login");
console.log('[LOG-FLUXO] Inicializando LoginRouter e preparando rotas de autenticação.');
const LoginRouter = (0, express_1.Router)();
// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================
console.log('[LOG-FLUXO] Mapeando Rota: POST /login -> AuthController.login (Pública)');
/**
 * Rota pública para autenticação de usuários.
 * Recebe identificador (E-mail/CPF) e senha para geração de token JWT.
 */
LoginRouter.post('/login', Controller_Login_1.AuthController.login);
console.log('[LOG-FLUXO] LoginRouter configurado com sucesso e pronto para acoplamento principal.');
exports.default = LoginRouter;
