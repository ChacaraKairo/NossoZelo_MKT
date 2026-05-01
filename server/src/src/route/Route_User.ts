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
import { validarUsuario } from '../middleware/user';const UserRouter = Router();/**
 * Esta única rota agora substitui as antigas /cuidador, /enfermeiro e /admin.
 * O UserController.criarUsuario lê o "req.body.usuario.tipo" e roteia automaticamente.
 */
UserRouter.post('/usuario', validarUsuario, UserController.criarUsuario);UserRouter.get(
  '/usuario/:id',
  UserController.buscarUsuarioCompleto,
);UserRouter.put(
  '/usuario/:id',
  UserController.atualizarUsuario,
);UserRouter.put(
  '/usuario/:id/senha',
  UserController.atualizarSenha,
);UserRouter.delete(
  '/usuario/:id',
  UserController.deletarUsuario,
);export default UserRouter;
