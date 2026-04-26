/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por processar o feedback dos usuários e gerir a reputação dos prestadores,
 * atuando como intermediário entre a requisição de avaliação e o serviço de persistência de prova social.
 */

import { Request, Response } from 'express';
import { AuthRequest } from './Controller_Perfil';
import ServiceAvaliacao from '../service/Service_Avaliacao';

class ControllerAvaliacao {
  /**
   * Recebe a nota e o comentário do cliente, injeta o ID da sessão e processa a atualização do ranking.
   * @param {AuthRequest} req - Requisição contendo os dados da avaliação no body e o usuário autenticado.
   * @param {Response} res - Objeto de resposta HTTP.
   * @returns {Promise<Response>} - Retorna o resultado da operação de avaliação.
   */
  static async registrar(req: AuthRequest, res: Response) {
    const clienteId = req.user?.id;
    console.log(
      `[LOG-FLUXO] Controller: Iniciando processamento de nova avaliação enviada pelo Cliente: ${
        clienteId || 'N/A'
      }`,
    );

    try {
      // Ramificação condicional: Verificação de integridade da sessão (Fail Fast)
      if (!clienteId) {
        console.error(
          '[ERRO-FLUXO] Falha de autorização: Tentativa de registro de avaliação sem cliente identificado na sessão.',
        );
        return res.status(401).json({
          error: 'Cliente não identificado na sessão.',
        });
      }

      /**
       * Preparação do payload unificando os dados do corpo com a identidade do autor.
       * Mantendo a nomenclatura original 'payload'.
       */
      const payload = {
        ...req.body,
        cliente_id: clienteId,
      };

      console.log(
        `[LOG-FLUXO] Delegando lógica de negócio e recálculo de média para ServiceAvaliacao.registrarAvaliacao.`,
      );

      // Invocação do serviço especializado
      const resultado =
        await ServiceAvaliacao.registrarAvaliacao(payload);

      console.log(
        `[LOG-FLUXO] Sucesso: Avaliação ID ${resultado.id} processada com sucesso. A média do prestador foi atualizada.`,
      );

      // Retorno de sucesso (Created)
      return res.status(201).json(resultado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Exceção capturada no fluxo de avaliação: ${
          error.message || error
        }`,
      );

      return res
        .status(error.status || 400)
        .json({ error: error.message });
    }
  }

  /**
   * Lista as avaliações de um prestador específico.
   * Rota: GET /avaliacoes/prestador/:id
   */
  static async listarPorPrestador(
    req: Request,
    res: Response,
  ) {
    const { id } = req.params;
    try {
      const avaliacoes =
        await ServiceAvaliacao.obterAvaliacoesPorPrestador(
          id,
        );
      return res.status(200).json(avaliacoes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default ControllerAvaliacao;
