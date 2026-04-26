import { Request, Response } from 'express';
import ServiceServico from '../service/Service_Servico';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tipo: string;
  };
}

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

function mensagemErro(error: any) {
  return error?.message || 'Erro interno ao processar serviço.';
}

class ControllerServico {
  static async listarMeus(req: AuthRequest, res: Response) {
    try {
      const servicos = await ServiceServico.listarMeus(req.user as any);
      return res.status(200).json(servicos);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async criar(req: AuthRequest, res: Response) {
    try {
      const servico = await ServiceServico.criar(req.body, req.user as any);
      return res.status(201).json(servico);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async atualizar(req: AuthRequest, res: Response) {
    try {
      const servico = await ServiceServico.atualizar(
        Number(req.params.id),
        req.body,
        req.user as any,
      );
      return res.status(200).json(servico);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async remover(req: AuthRequest, res: Response) {
    try {
      const resultado = await ServiceServico.remover(
        Number(req.params.id),
        req.user as any,
      );
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }
}

export default ControllerServico;
