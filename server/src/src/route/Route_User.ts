/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas da entidade Usuário, centralizando os endpoints de
 * cadastro unificado, gerenciamento de perfil, atualização de credenciais e exclusão de registros.
 * @rota server\src\src\route\Route_User
 */

import { Router } from 'express';
import UserController from '../controller/Controller_User';
import { validarUsuario } from '../middleware/user'; // Mantenha se for usar futuramente

console.log(
  '[LOG-FLUXO] Inicializando UserRouter e configurando endpoints de usuários.',
);
const UserRouter = Router();

// ==========================================
// 1. ROTA DE CRIAÇÃO (UNIFICADA)
// ==========================================
console.log(
  '[LOG-FLUXO] Mapeando Rota: POST /usuario -> UserController.criarUsuario',
);
/**
 * Esta única rota agora substitui as antigas /cuidador, /enfermeiro e /admin.
 * O UserController.criarUsuario lê o "req.body.usuario.tipo" e roteia automaticamente.
 */
UserRouter.post('/usuario', validarUsuario, UserController.criarUsuario);

// ==========================================
// 2. ROTAS DE LEITURA E ATUALIZAÇÃO
// ==========================================
console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /usuario/:id -> UserController.buscarUsuarioCompleto',
);
UserRouter.get(
  '/usuario/:id',
  UserController.buscarUsuarioCompleto,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: PUT /usuario/:id -> UserController.atualizarUsuario',
);
UserRouter.put(
  '/usuario/:id',
  UserController.atualizarUsuario,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: PUT /usuario/:id/senha -> UserController.atualizarSenha',
);
UserRouter.put(
  '/usuario/:id/senha',
  UserController.atualizarSenha,
);

// ==========================================
// 3. ROTAS DE DELEÇÃO
// ==========================================
console.log(
  '[LOG-FLUXO] Mapeando Rota: DELETE /usuario/:id -> UserController.deletarUsuario',
);
UserRouter.delete(
  '/usuario/:id',
  UserController.deletarUsuario,
);

console.log(
  '[LOG-FLUXO] UserRouter configurado com sucesso e pronto para acoplamento no Router Principal.',
);

export default UserRouter;
