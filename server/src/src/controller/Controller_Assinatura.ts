import { Request, Response } from 'express';
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

function dadosPagamentoDoBody(body: any, req: Request) {
  const dadosPagamento = body?.dadosPagamento;
  if (dadosPagamento === undefined || dadosPagamento === null) return undefined;

  if (!dadosPagamento || typeof dadosPagamento !== 'object') {
    const error = new Error('Dados de pagamento invalidos.') as Error & {
      status?: number;
    };
    error.status = 400;
    throw error;
  }

  return {
    metodoPagamento: dadosPagamento.metodoPagamento,
    creditCard: dadosPagamento.creditCard,
    creditCardHolderInfo: dadosPagamento.creditCardHolderInfo,
    creditCardToken: dadosPagamento.creditCardToken,
    remoteIp:
      req.ip ||
      String(req.headers['x-forwarded-for'] || '')
        .split(',')[0]
        .trim(),
  };
}

class ControllerAssinatura {
  async webhookAsaas(req: Request, res: Response) {
    try {
      const tokenHeader = req.headers['asaas-access-token'];
      const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
      const resultado = await ServiceAssinatura.processarWebhookAsaas({
        token,
        payload: req.body,
      });

      const statusHttp = resultado.processado ? 200 : 202;
      return res.status(statusHttp).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

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

  async planos(_req: Request, res: Response) {
    try {
      const planos = await ServiceAssinatura.listarPlanosDisponiveis();
      return res.status(200).json(planos);
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

  async iniciar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const planoId = planoIdDoBody(req.body);
      const dadosPagamento = dadosPagamentoDoBody(req.body, req);
      const resultado =
        await ServiceAssinatura.iniciarOuRegularizarAssinatura(
          req.user.id,
          planoId,
          dadosPagamento,
        );

      return res.status(201).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async regularizar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuario nao autenticado.' });
      }

      const planoId = planoIdDoBody(req.body);
      const dadosPagamento = dadosPagamentoDoBody(req.body, req);
      const resultado =
        await ServiceAssinatura.iniciarOuRegularizarAssinatura(
          req.user.id,
          planoId,
          dadosPagamento,
        );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message });
    }
  }

  async cancelar(req: AuthRequest, res: Response) {
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
