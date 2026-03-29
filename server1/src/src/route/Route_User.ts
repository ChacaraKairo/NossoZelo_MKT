import { Router } from 'express';
import UserController from '../controller/Controller_User';
import { validarUsuario } from '../middleware/user'; // ajuste o caminho se necessário

const UserRouter = Router();

UserRouter.post('/usuario', UserController.criarUsuario);

// UserRouter.post('/cuidador', UserController.criarCuidador);

// UserRouter.post(
//   '/enfermeiro',
//   UserController.criarEnfermeiro,
// );

// UserRouter.post('/admin', UserController.criarAdmin);

// UserRouter.get(
//   '/usuario/:id',
//   UserController.buscarUsuarioCompleto,
// );

// UserRouter.put(
//   '/usuario/:id',
//   UserController.atualizarUsuario,
// );

// UserRouter.put(
//   '/usuario/:id/senha',
//   UserController.atualizarSenha,
// );

// UserRouter.delete(
//   '/usuario/:id',
//   UserController.deletarUsuario,
// );

export default UserRouter;
