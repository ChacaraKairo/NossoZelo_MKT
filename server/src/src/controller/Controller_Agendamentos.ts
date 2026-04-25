import { Request, Response } from 'express';
import ServiceAgendamento from '../service/Service_Agendamento';

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
  return error?.message || 'Erro interno ao processar agendamento.';
}

class AgendamentoController {
  static async criar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Cliente nao identificado na sessao.' });
      }

      const novoAgendamento =
        await ServiceAgendamento.criarAgendamento(
          req.body,
          req.user,
        );

      return res.status(201).json(novoAgendamento);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async aceitar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Prestador nao identificado na sessao.' });
      }

      const resultado =
        await ServiceAgendamento.aceitarContratacao(
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

  static async cancelar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Prestador nao identificado na sessao.' });
      }

      const resultado =
        await ServiceAgendamento.cancelarContratacao(
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

  static async finalizar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Usuario nao identificado na sessao.' });
      }

      const resultado =
        await ServiceAgendamento.finalizarContratacao(
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

  static async registroManual(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Prestador nao identificado na sessao.' });
      }

      const registro = await ServiceAgendamento.registroManual(
        req.body,
        req.user,
      );

      return res.status(201).json(registro);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async listarPorTempo(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Usuario nao identificado na sessao.' });
      }

      const prestadorId = req.params.id;
      const dias = parseInt(req.query.dias as string, 10) || 30;

      const agendamentos =
        await ServiceAgendamento.listar_agendamentos_por_tempo(
          dias,
          prestadorId,
          req.user,
        );

      return res.status(200).json(agendamentos);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async listarPorCliente(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res
          .status(401)
          .json({ error: 'Usuario nao identificado na sessao.' });
      }

      const agendamentos =
        await ServiceAgendamento.agendamentos_cliente(
          req.params.id,
          req.user,
        );

      return res.status(200).json(agendamentos);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }
}

export default AgendamentoController;
