import { Response } from 'express';
import ServiceAssinatura from '../service/Service_Assinatura';
import { AuthRequest } from '../types/auth';

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

function planoIdDoBody(body: any) {
  const planoId = Number(body?.planoId ?? body?.plano_id);
  if (!Number.isInteger(planoId) || planoId <= 0) {
    const error = new Error('Informe um plano valido.') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  return planoId;
}

class ControllerAssinatura {
  async minha(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const status =
        await ServiceAssinatura.obterStatusAssinaturaPrestador(req.user.id);
      return res.status(200).json(status);
    } catch (error: any) {
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

      if (req.user.tipo !== 'admin' && req.user.id !== req.params.prestadorId) {
        return res
          .status(403)
          .json({ error: 'Acesso negado para consultar esta assinatura.' });
      }

      const status =
        await ServiceAssinatura.obterStatusAssinaturaPrestador(
          req.params.prestadorId,
        );
      return res.status(200).json(status);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async iniciarMock(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const planoId = planoIdDoBody(req.body);
      const resultado =
        await ServiceAssinatura.iniciarOuRegularizarAssinaturaMock(
          req.user.id,
          planoId,
        );

      return res.status(201).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async regularizarMock(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const planoId = planoIdDoBody(req.body);
      const resultado =
        await ServiceAssinatura.iniciarOuRegularizarAssinaturaMock(
          req.user.id,
          planoId,
        );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async cancelarMock(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const assinatura =
        await ServiceAssinatura.cancelarAssinaturaPrestador(req.user.id);

      return res.status(200).json({
        message: 'Assinatura cancelada com sucesso.',
        assinatura,
      });
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async expirarPendentes(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      if (req.user.tipo !== 'admin') {
        return res
          .status(403)
          .json({ error: 'Apenas administradores podem expirar pendentes.' });
      }

      const resultado =
        await ServiceAssinatura.expirarAssinaturasSemConfirmacao();
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }
}

export default new ControllerAssinatura();
