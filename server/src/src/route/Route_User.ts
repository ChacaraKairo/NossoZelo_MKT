import { Router } from 'express';
import UserController from '../controller/Controller_User';
import { validarUsuario } from '../middleware/user';
import { rateLimit } from '../middleware/rateLimit';
import {
  exigirAutenticacao,
  permitirDonoOuAdmin,
} from '../middleware/autorizacao';

const UserRouter = Router();

const cadastroRateLimit = rateLimit({
  nome: 'cadastro_usuario',
  janelaMs: 15 * 60 * 1000,
  max: 8,
});

UserRouter.post('/usuario', cadastroRateLimit, validarUsuario, UserController.criarUsuario);
UserRouter.get('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.buscarUsuarioCompleto);
UserRouter.put('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.atualizarUsuario);
UserRouter.put('/usuario/:id/senha', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.atualizarSenha);
UserRouter.delete('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.deletarUsuario);

export default UserRouter;
