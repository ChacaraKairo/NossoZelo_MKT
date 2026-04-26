import { Request, Response } from 'express';
import { ServiceAuth } from '../service/Service_Autenticacao';
import logger from '../lib/logger';

function erroAutenticacao(mensagem: string) {
  return mensagem.toLowerCase().includes('usuário ou senha inválidos');
}

export class AuthController {
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
