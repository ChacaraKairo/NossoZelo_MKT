/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de Autenticação, centralizando os endpoints de
 * validação de credenciais (Login) e acesso público ao sistema.
 * @rota server\src\src\route\Route_Login
 */

import { Router } from 'express';
import { AuthController } from '../controller/Controller_Login';
import { authMiddleware } from '../middleware/autenticacao';

console.log(
  '[LOG-FLUXO] Inicializando LoginRouter e preparando rotas de autenticação.',
);
const LoginRouter = Router();

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: POST /login -> AuthController.login (Pública)',
);
/**
 * Rota pública para autenticação de usuários.
 * Recebe identificador (E-mail/CPF) e senha para geração de token JWT.
 */
LoginRouter.post('/login', AuthController.login);

console.log(
  '[LOG-FLUXO] LoginRouter configurado com sucesso e pronto para acoplamento principal.',
);

export default LoginRouter;
