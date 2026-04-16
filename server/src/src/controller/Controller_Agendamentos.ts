/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP relacionadas ao agendamento de serviços,
 * mediando o ciclo de vida das contratações (Aceite/Finalização) e o registro manual de métricas de experiência.
 */

import { Request, Response } from 'express';
import ServiceAgendamento from '../service/Service_Agendamento';

/**
 * Interface estendida para suportar dados de autenticação injetados pelo middleware de segurança.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    tipo: string;
  };
}

class AgendamentoController {
  /**
   * Endpoint para criar uma nova contratação/agendamento com status inicial 'pendente'.
   * @param {Request} req - Requisição contendo os dados do serviço no corpo (body).
   * @param {Response} res - Resposta HTTP 201 em caso de sucesso.
   * @returns {Promise<Response>}
   */
  static async criar(req: Request, res: Response) {
    console.log(
      `[LOG-FLUXO] Iniciando criar agendamento no controller. Payload recebido: ${JSON.stringify(
        req.body,
      )}`,
    );

    try {
      console.log(
        '[LOG-FLUXO] Delegando persistência inicial ao ServiceAgendamento.criarAgendamento.',
      );

      const novoAgendamento =
        await ServiceAgendamento.criarAgendamento(req.body);

      console.log(
        `[LOG-FLUXO] Sucesso: Agendamento ID ${novoAgendamento.id} registrado com status: ${novoAgendamento.status}.`,
      );

      return res.status(201).json(novoAgendamento);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao processar criação de agendamento no controller: ${error.message}`,
      );

      return res
        .status(500)
        .json({ erro: error.message || 'Erro interno' });
    }
  }

  /**
   * Aceita uma contratação pendente, liberando o Portão de Privacidade para o prestador.
   * @param {AuthRequest} req - Parâmetro 'id' da contratação na URL.
   * @param {Response} res - Resposta HTTP 200.
   * @returns {Promise<Response>}
   */
  static async aceitar(req: AuthRequest, res: Response) {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Controller: Recebendo solicitação de aceite para contratação ID ${id}.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Invocando transição de status para 'confirmado' no ServiceAgendamento para ID: ${id}`,
      );

      const resultado =
        await ServiceAgendamento.aceitarContratacao(
          Number(id),
        );

      console.log(
        `[LOG-FLUXO] Sucesso: Contratação ${id} confirmada. Portão de Privacidade (Privacy Gate) liberado.`,
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao processar aceite de contratação no controller para ID ${id}: ${error.message}`,
      );

      return res.status(500).json({ erro: error.message });
    }
  }

  /**
   * Finaliza uma contratação previamente confirmada, preparando-a para a etapa de avaliação de desempenho.
   * @param {AuthRequest} req - Parâmetro 'id' da contratação na URL.
   * @param {Response} res - Resposta HTTP 200.
   * @returns {Promise<Response>}
   */
  static async finalizar(req: AuthRequest, res: Response) {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Controller: Recebendo solicitação de finalização para contratação ID ${id}.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Invocando transição para 'concluido' no ServiceAgendamento para ID: ${id}`,
      );

      const resultado =
        await ServiceAgendamento.finalizarContratacao(
          Number(id),
        );

      console.log(
        `[LOG-FLUXO] Sucesso: Contratação ${id} concluída com êxito. Fluxo liberado para avaliação.`,
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao finalizar contratação no controller para ID ${id}: ${error.message}`,
      );

      return res.status(500).json({ erro: error.message });
    }
  }

  /**
   * Registro Manual: Permite que o prestador autenticado registre serviços realizados fora da plataforma NossoZelo.
   * @param {AuthRequest} req - Dados do serviço manual no body e ID do prestador no token.
   * @param {Response} res - Resposta HTTP 201.
   * @returns {Promise<Response>}
   */
  static async registroManual(
    req: AuthRequest,
    res: Response,
  ) {
    const prestadorId = req.user?.id;
    console.log(
      `[LOG-FLUXO] Controller: Iniciando fluxo de registro manual de serviço para o Prestador: ${prestadorId}.`,
    );

    try {
      // Mesclagem de dados do body com a identidade do prestador autenticado
      const dadosCompletos = {
        ...req.body,
        prestador_id: prestadorId,
      };

      console.log(
        `[LOG-FLUXO] Despachando registro externo ao ServiceAgendamento.registroManual para Prestador ${prestadorId}.`,
      );

      const registro =
        await ServiceAgendamento.registroManual(
          dadosCompletos,
        );

      console.log(
        `[LOG-FLUXO] Sucesso: Serviço manual registrado sob ID ${registro.id} para fins de métricas de experiência.`,
      );

      return res.status(201).json(registro);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha no registro manual via controller para o prestador ${prestadorId}: ${error.message}`,
      );

      return res.status(500).json({ erro: error.message });
    }
  }

  /**
   * Lista os agendamentos de um prestador dentro de uma janela temporal específica (Destaque nas Telas B e C).
   * @param {Request} req - Params: id (prestador) | Query: dias (padrão 7).
   * @param {Response} res - Resposta HTTP 200 com a lista de agendamentos.
   * @returns {Promise<Response>}
   */
  static async listarPorTempo(req: Request, res: Response) {
    const prestadorId = req.params.id;
    const dias = parseInt(req.query.dias as string) || 7;

    console.log(
      `[LOG-FLUXO] Consultando agenda cronológica para o prestador ${prestadorId}. Janela: ${dias} dias.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando busca temporal ao ServiceAgendamento.listar_agendamentos_por_tempo...`,
      );

      const agendamentos =
        await ServiceAgendamento.listar_agendamentos_por_tempo(
          dias,
          prestadorId,
        );

      console.log(
        `[LOG-FLUXO] Consulta cronológica finalizada. Total de registros localizados: ${
          agendamentos ? agendamentos.length : 0
        }.`,
      );

      return res.status(200).json(agendamentos);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na listagem temporal de agenda para o prestador ${prestadorId}: ${error.message}`,
      );

      return res.status(500).json({ erro: error.message });
    }
  }

  /**
   * Recupera o histórico completo de contratações de um cliente específico (Visão da Tela A).
   * @param {Request} req - Parâmetro 'id' do cliente na URL.
   * @param {Response} res - Resposta HTTP 200 com o histórico.
   * @returns {Promise<Response>}
   */
  static async listarPorCliente(
    req: Request,
    res: Response,
  ) {
    const clienteId = req.params.id;
    console.log(
      `[LOG-FLUXO] Buscando histórico completo de contratações para o cliente ID: ${clienteId}.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando histórico ao ServiceAgendamento.agendamentos_cliente...`,
      );

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
        `[ERRO-FLUXO] Falha ao recuperar listagem histórica para o cliente ${clienteId}: ${error.message}`,
      );

      return res.status(500).json({ erro: error.message });
    }
  }
}

export default AgendamentoController;
