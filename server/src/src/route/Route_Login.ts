import { Router } from 'express';
import { AuthController } from '../controller/Controller_Login';
import { authMiddleware } from '../middleware/autenticacao';

const LoginRouter = Router();

// Rota pública
LoginRouter.post('/login', AuthController.login);

export default LoginRouter;
