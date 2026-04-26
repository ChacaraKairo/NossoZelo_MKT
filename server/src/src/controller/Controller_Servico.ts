import { Request, Response } from 'express';
import ServiceServico from '../service/Service_Servico';

type AuthRequest = Request;

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

function mensagemErro(error: any) {
  return error?.message || 'Erro interno ao processar serviço.';
}

class ControllerServico {
  static async listarMeus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const servicos = await ServiceServico.listarMeus(req.user);
      return res.status(200).json(servicos);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async criar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const servico = await ServiceServico.criar(req.body, req.user);
      return res.status(201).json(servico);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async atualizar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const servico = await ServiceServico.atualizar(
        Number(req.params.id),
        req.body,
        req.user,
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
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const resultado = await ServiceServico.remover(
        Number(req.params.id),
        req.user,
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
