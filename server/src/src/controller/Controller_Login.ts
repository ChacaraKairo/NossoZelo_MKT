import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { ServiceAuth } from '../service/Service_Autenticacao';
import logger from '../lib/logger';

const OAUTH_STATE_COOKIE = 'nossozelo_oauth_state';

function erroAutenticacao(mensagem: string) {
  return mensagem.toLowerCase().includes('usuário ou senha inválidos');
}

export class AuthController {
  static iniciarSocial(provider: 'google' | 'facebook') {
    return (_req: Request, res: Response) => {
      try {
        const state = randomBytes(24).toString('hex');
        res.cookie(OAUTH_STATE_COOKIE, state, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 10 * 60 * 1000,
        });
        return res.redirect(ServiceAuth.iniciarLoginSocial(provider, state));
      } catch (error: any) {
        logger.error('AuthController: falha ao iniciar login social', {
          provider,
          erro: error?.message,
        });
        return res.status(500).json({
          error: error?.message || 'Login social indisponivel.',
        });
      }
    };
  }

  static callbackSocial(provider: 'google' | 'facebook') {
    return async (req: Request, res: Response) => {
      try {
        const code = String(req.query.code || '');
        const state = String(req.query.state || '');
        const stateCookie = String(req.cookies?.[OAUTH_STATE_COOKIE] || '');
        res.clearCookie(OAUTH_STATE_COOKIE);

        if (!state || !stateCookie || state !== stateCookie) {
          return res.status(400).json({ error: 'Estado OAuth invalido.' });
        }
        if (!code) {
          return res.status(400).json({ error: 'Codigo OAuth ausente.' });
        }

        const redirectUrl = await ServiceAuth.concluirCallbackSocial(
          provider,
          code,
        );
        return res.redirect(redirectUrl);
      } catch (error: any) {
        logger.error('AuthController: falha no callback social', {
          provider,
          erro: error?.message,
        });

        const frontendUrl =
          process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(
          `${frontendUrl}/login-user?erroSocial=${encodeURIComponent(
            error?.message || 'Falha no login social.',
          )}`,
        );
      }
    };
  }

  static async completarCadastroSocial(req: Request, res: Response) {
    try {
      const result = await ServiceAuth.completarCadastroSocial(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      logger.error('AuthController: falha ao completar cadastro social', {
        erro: error?.message,
      });
      return res.status(400).json({
        error:
          error?.message ||
          'Nao foi possivel completar o cadastro social.',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { identificador, senha } = req.body || {};

      if (!identificador || !senha) {
        logger.warn('AuthController: payload de login incompleto', {
          ip: req.ip,
        });
        return res.status(400).json({
          error: 'Identificador e senha são obrigatórios.',
        });
      }

      const result = await ServiceAuth.login({
        identificador,
        senha,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      if (erroAutenticacao(error?.message || '')) {
        return res.status(401).json({
          error: 'Usuário ou senha inválidos.',
        });
      }

      logger.error('AuthController: erro interno no login', {
        erro: error?.message || 'Erro desconhecido',
      });

      return res.status(500).json({
        error:
          'Erro interno ao processar login. Tente novamente em instantes.',
      });
    }
  }
}

export default AuthController;

