import { Request, Response } from 'express';
import ServiceConfirmacaoEmail from '../service/Service_ConfirmacaoEmail';
import { AuthRequest } from '../types/auth';
import logger from '../lib/logger';

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

class ControllerConfirmacaoEmail {
  async confirmar(req: Request, res: Response) {
    try {
      const token =
        req.method === 'POST'
          ? String(req.body?.token || '')
          : String(req.query.token || '');

      const resultado = await ServiceConfirmacaoEmail.confirmarEmail(token);
      return res.status(200).json(resultado);
    } catch (error: any) {
      logger.error('ControllerConfirmacaoEmail: falha ao confirmar email', {
        status: statusErro(error),
        error,
      });

      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async reenviar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const resultado =
        await ServiceConfirmacaoEmail.reenviarConfirmacao(req.user.id);
      return res.status(200).json(resultado);
    } catch (error: any) {
      logger.error('ControllerConfirmacaoEmail: falha ao reenviar confirmacao', {
        usuarioId: req.user?.id,
        status: statusErro(error),
        error,
      });

      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async status(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const resultado =
        await ServiceConfirmacaoEmail.obterStatusEmail(req.user.id);
      return res.status(200).json(resultado);
    } catch (error: any) {
      logger.error('ControllerConfirmacaoEmail: falha ao consultar status', {
        usuarioId: req.user?.id,
        status: statusErro(error),
        error,
      });

      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }
}

export default new ControllerConfirmacaoEmail();
