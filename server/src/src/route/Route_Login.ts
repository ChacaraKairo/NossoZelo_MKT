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
import { rateLimit } from '../middleware/rateLimit';
import RecuperacaoSenhaController from '../controller/Controller_RecuperacaoSenha';const LoginRouter = Router();
const provedoresSociais = ['google', 'facebook'] as const;
type ProvedorSocial = (typeof provedoresSociais)[number];
const loginRateLimit = rateLimit({
  nome: 'login',
  janelaMs: 15 * 60 * 1000,
  max: 10,
});
const recuperacaoRateLimit = rateLimit({
  nome: 'recuperacao_senha',
  janelaMs: 15 * 60 * 1000,
  max: 5,
});

function isProvedorSocial(provider: string): provider is ProvedorSocial {
  return provedoresSociais.includes(provider as ProvedorSocial);
}/**
 * Rota pública para autenticação de usuários.
 * Recebe identificador (E-mail/CPF) e senha para geração de token JWT.
 */
LoginRouter.post('/login', loginRateLimit, AuthController.login);
LoginRouter.get(
  '/social/:provider',
  (req, res) => {
    const provider = String(req.params.provider || '');

    if (!isProvedorSocial(provider)) {
      return res.status(404).json({
        error: 'Provedor social nao suportado.',
      });
    }

    return AuthController.iniciarSocial(provider)(req, res);
  },
);
LoginRouter.get(
  '/social/:provider/callback',
  (req, res) => {
    const provider = String(req.params.provider || '');

    if (!isProvedorSocial(provider)) {
      return res.status(404).json({
        error: 'Provedor social nao suportado.',
      });
    }

    return AuthController.callbackSocial(provider)(req, res);
  },
);
LoginRouter.post(
  '/social/completar-cadastro',
  AuthController.completarCadastroSocial,
);
LoginRouter.post(
  '/recuperar-senha',
  recuperacaoRateLimit,
  RecuperacaoSenhaController.enviarEmail,
);
LoginRouter.get(
  '/recuperar-senha/validar-token',
  recuperacaoRateLimit,
  RecuperacaoSenhaController.validarToken,
);
LoginRouter.post(
  '/redefinir-senha',
  recuperacaoRateLimit,
  RecuperacaoSenhaController.redefinirSenha,
);export default LoginRouter;
