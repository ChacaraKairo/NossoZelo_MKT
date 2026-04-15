/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP relacionadas ao agendamento de serviços,
 * mediando a criação de novas contratações e a consulta de agendas para prestadores e clientes.
 * @rota server\src\src\controller\Controller_Agendamentos.ts
 */

import { Request, Response } from 'express';
import ServiceAgendamento from '../service/Service_Agendamento';

class AgendamentoController {
  /**
   * Endpoint para criar uma nova contratação/agendamento.
   * @param {Request} req - Requisição contendo os dados da contratação no body.
   * @param {Response} res - Resposta HTTP 201 (Created).
   * @returns {Promise<Response>}
   */
  static async criar(req: Request, res: Response) {
    console.log(
      `[LOG-FLUXO] Iniciando criar no AgendamentoController. Payload recebido: ${JSON.stringify(
        req.body,
      )}`,
    );

    try {
      console.log(
        '[LOG-FLUXO] Delegando lógica de criação de agendamento para ServiceAgendamento.criarAgendamento.',
      );

      // Chamada assíncrona para o serviço de agendamento
      const novoAgendamento =
        await ServiceAgendamento.criarAgendamento(req.body);

      console.log(
        `[LOG-FLUXO] Sucesso: Agendamento criado. ID: ${novoAgendamento.id}, Status: ${novoAgendamento.status}. Enviando Status 201.`,
      );

      return res.status(201).json(novoAgendamento);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao processar criação de agendamento no controller: ${
          error.message || error
        }`,
      );

      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }

  /**
   * Lista os agendamentos de um prestador filtrados por um intervalo de dias retroativos.
   * @param {Request} req - Params: id (prestador) | Query: dias (opcional, padrão 7).
   * @param {Response} res - Resposta HTTP 200.
   * @returns {Promise<Response>}
   */
  static async listarPorTempo(req: Request, res: Response) {
    const prestadorId = req.params.id;
    const dias = parseInt(req.query.dias as string) || 7;

    console.log(
      `[LOG-FLUXO] Iniciando listarPorTempo no AgendamentoController. PrestadorID: ${prestadorId}, Janela: ${dias} dias.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando consulta temporal ao ServiceAgendamento para o prestador: ${prestadorId}`,
      );

      // Chamada assíncrona ao serviço mantendo nomenclatura snake_case
      const agendamentos =
        await ServiceAgendamento.listar_agendamentos_por_tempo(
          dias,
          prestadorId,
        );

      console.log(
        `[LOG-FLUXO] Busca cronológica finalizada. Total de agendamentos localizados: ${
          agendamentos ? agendamentos.length : 0
        }.`,
      );

      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na listagem por tempo para o prestador ${prestadorId}: ${
          error.message || error
        }`,
      );

      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }

  /**
   * Recupera o histórico de todas as contratações realizadas por um cliente específico.
   * @param {Request} req - Params: id (cliente).
   * @param {Response} res - Resposta HTTP 200.
   * @returns {Promise<Response>}
   */
  static async listarPorCliente(
    req: Request,
    res: Response,
  ) {
    const clienteId = req.params.id;
    console.log(
      `[LOG-FLUXO] Iniciando listarPorCliente no AgendamentoController para o ClienteID: ${clienteId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Invocando ServiceAgendamento.agendamentos_cliente para recuperar vínculo do cliente: ${clienteId}`,
      );

      // Chamada assíncrona ao serviço mantendo nomenclatura snake_case
      const agendamentos =
        await ServiceAgendamento.agendamentos_cliente(
          clienteId,
        );

      console.log(
        `[LOG-FLUXO] Histórico do cliente ${clienteId} recuperado com êxito. Itens: ${
          agendamentos ? agendamentos.length : 0
        }.`,
      );

      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao buscar agendamentos do cliente ${clienteId}: ${
          error.message || error
        }`,
      );

      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }
}

export default AgendamentoController;
