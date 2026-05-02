import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { ServiceAuth } from '../service/Service_Autenticacao';
import logger from '../lib/logger';
import { AuthRequest } from '../types/auth';
import {
  definirCookieCadastroSocial,
  definirCookieSessao,
  limparCookieCadastroSocial,
  limparCookieSessao,
  SOCIAL_SIGNUP_COOKIE_NAME,
} from '../lib/sessionCookie';

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

        const resultado = await ServiceAuth.concluirCallbackSocial(
          provider,
          code,
        );

        if (resultado.tipo === 'login') {
          definirCookieSessao(res, resultado.token);
        } else {
          definirCookieCadastroSocial(res, resultado.tokenCadastro);
        }

        return res.redirect(resultado.redirectUrl);
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
      const result = await ServiceAuth.completarCadastroSocial({
        ...req.body,
        socialToken:
          req.body?.socialToken ||
          req.cookies?.[SOCIAL_SIGNUP_COOKIE_NAME],
      });
      definirCookieSessao(res, result.token);
      limparCookieCadastroSocial(res);
      const { token, ...response } = result;
      return res.status(201).json(response);
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

      definirCookieSessao(res, result.token);
      const { token, ...response } = result;
      return res.status(200).json(response);
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

  static async me(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const result = await ServiceAuth.obterUsuarioAutenticado(usuarioId);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.warn('AuthController: falha ao carregar sessao', {
        erro: error?.message,
      });
      return res.status(401).json({ error: 'Sessao invalida.' });
    }
  }

  static logout(_req: Request, res: Response) {
    limparCookieSessao(res);
    limparCookieCadastroSocial(res);
    return res.status(200).json({ message: 'Sessao encerrada.' });
  }

  static async cadastroSocialPendente(req: Request, res: Response) {
    try {
      const token = req.cookies?.[SOCIAL_SIGNUP_COOKIE_NAME];
      if (!token) {
        return res.status(401).json({
          error: 'Cadastro social pendente ausente.',
        });
      }

      const dados = await ServiceAuth.obterCadastroSocialPendente(token);
      return res.status(200).json(dados);
    } catch (error: any) {
      limparCookieCadastroSocial(res);
      return res.status(401).json({
        error: error?.message || 'Cadastro social pendente invalido.',
      });
    }
  }
}

export default AuthController;

