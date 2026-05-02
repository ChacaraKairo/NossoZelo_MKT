import { Router } from 'express';
import UserController from '../controller/Controller_User';
import { validarUsuario } from '../middleware/user';
import { rateLimit } from '../middleware/rateLimit';
import { authMiddleware } from '../middleware/autenticacao';
import { autorizarUsuarioAlvo } from '../middleware/autorizarUsuarioAlvo';

const UserRouter = Router();

const cadastroRateLimit = rateLimit({
  nome: 'cadastro_usuario',
  janelaMs: 15 * 60 * 1000,
  max: 8,
});

UserRouter.post('/usuario', cadastroRateLimit, validarUsuario, UserController.criarUsuario);
UserRouter.get('/usuario/:id', authMiddleware, autorizarUsuarioAlvo, UserController.buscarUsuarioCompleto);
UserRouter.put('/usuario/:id', authMiddleware, autorizarUsuarioAlvo, UserController.atualizarUsuario);
UserRouter.put('/usuario/:id/senha', authMiddleware, autorizarUsuarioAlvo, UserController.atualizarSenha);
UserRouter.delete('/usuario/:id', authMiddleware, autorizarUsuarioAlvo, UserController.deletarUsuario);

export default UserRouter;
