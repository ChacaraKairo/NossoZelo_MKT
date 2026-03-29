import { Request, Response } from 'express';
import ServiceAgendamento from '../service/Service_Agendamento';

class AgendamentoController {
  // POST /agendamentos
  static async criar(req: Request, res: Response) {
    try {
      const novoAgendamento =
        await ServiceAgendamento.criarAgendamento(req.body);
      return res.status(201).json(novoAgendamento);
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }

  // GET /agendamentos/prestador/:id?dias=7
  static async listarPorTempo(req: Request, res: Response) {
    try {
      const prestadorId = req.params.id;
      const dias = parseInt(req.query.dias as string) || 7;
      const agendamentos =
        await ServiceAgendamento.listar_agendamentos_por_tempo(
          dias,
          prestadorId,
        );
      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error('Erro ao listar agendamentos:', error);
      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }

  // GET /agendamentos/cliente/:id
  static async listarPorCliente(
    req: Request,
    res: Response,
  ) {
    try {
      const clienteId = req.params.id;
      const agendamentos =
        await ServiceAgendamento.agendamentos_cliente(
          clienteId,
        );
      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error(
        'Erro ao listar agendamentos do cliente:',
        error,
      );
      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }
}

export default AgendamentoController;
