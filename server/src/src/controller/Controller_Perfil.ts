/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP relacionadas aos perfis de usuários,
 * controlando o acesso a dados privados do usuário logado e a exposição de dados públicos na vitrine de prestadores.
 * @rota server\src\src\controller\Controller_Perfil.ts
 */

import { Request, Response } from 'express';
import { ServicePerfil } from '../service/Service_Perfil';

/**
 * Interface estendida para suportar dados de autenticação injetados pelo middleware.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    tipo: string;
  };
}

class ControllerPerfil {
  /**
   * Recupera os dados do perfil completo do usuário autenticado na sessão.
   * @param {AuthRequest} req - Requisição contendo o objeto user vindo do token JWT.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<Response>}
   */
  async obterMeuPerfil(req: AuthRequest, res: Response) {
    console.log(
      `[LOG-FLUXO] Iniciando obterMeuPerfil no ControllerPerfil. Verificando token de sessão.`,
    );

    try {
      const usuarioId = req.user?.id;

      // Ramificação condicional: Verificação de autorização (Fail Fast)
      if (!usuarioId) {
        console.error(
          `[ERRO-FLUXO] Acesso negado em obterMeuPerfil: Identificador de usuário ausente no AuthRequest.`,
        );
        return res
          .status(401)
          .json({ error: 'Não autorizado' });
      }

      console.log(
        `[LOG-FLUXO] Usuário autenticado identificado: ${usuarioId}. Solicitando perfil ao ServicePerfil.`,
      );

      // Operação assíncrona: Busca de perfil completo
      console.log(
        `[LOG-FLUXO] Chamando ServicePerfil.obterMeuPerfilCompleto para o ID: ${usuarioId}`,
      );
      const perfil =
        await ServicePerfil.obterMeuPerfilCompleto(
          usuarioId,
        );

      console.log(
        `[LOG-FLUXO] Perfil recuperado com sucesso para o usuário ${usuarioId}. Enviando Status 200.`,
      );
      return res.json(perfil);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Exceção capturada em obterMeuPerfil: ${
          error.message || error
        }`,
      );
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Retorna a vitrine pública de um prestador específico para visualização de clientes.
   * @param {Request} req - Requisição contendo o ID do prestador nos parâmetros.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<Response>}
   */
  async vitrinePrestador(req: Request, res: Response) {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando vitrinePrestador no ControllerPerfil para o ID: ${id}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Invocando ServicePerfil.obterVitrinePrestador para o ID: ${id}`,
      );
      const vitrine =
        await ServicePerfil.obterVitrinePrestador(id);

      console.log(
        `[LOG-FLUXO] Sucesso: Dados da vitrine para o prestador ${id} processados. Enviando Status 200.`,
      );
      return res.json(vitrine);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao localizar ou processar vitrine do prestador ${id}: ${
          error.message || error
        }`,
      );
      return res
        .status(404)
        .json({ error: 'Prestador não encontrado' });
    }
  }

  /**
   * Permite que um prestador visualize dados limitados de um cliente,
   * liberando contato apenas se houver serviço vinculado.
   * @param {AuthRequest} req - Requisição contendo ID do cliente no parâmetro e ID do prestador no token.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<Response>}
   */
  async dadosClienteParaPrestador(
    req: AuthRequest,
    res: Response,
  ) {
    const clienteId = req.params.id;
    const prestadorId = req.user?.id;

    console.log(
      `[LOG-FLUXO] Iniciando dadosClienteParaPrestador no ControllerPerfil. Alvo Cliente: ${clienteId}`,
    );

    try {
      // Ramificação condicional: Verificação de autorização do prestador (Fail Fast)
      if (!prestadorId) {
        console.error(
          `[ERRO-FLUXO] Acesso negado: Prestador não autenticado tentou acessar dados do cliente ${clienteId}.`,
        );
        return res
          .status(401)
          .json({ error: 'Não autorizado' });
      }

      console.log(
        `[LOG-FLUXO] Validando permissão de visualização: Prestador ${prestadorId} -> Cliente ${clienteId}`,
      );

      // Operação assíncrona: Verificação de vínculo e busca de dados
      console.log(
        `[LOG-FLUXO] Chamando ServicePerfil.obterDadosClienteParaPrestador com validação de contrato.`,
      );
      const dados =
        await ServicePerfil.obterDadosClienteParaPrestador(
          clienteId,
          prestadorId,
        );

      console.log(
        `[LOG-FLUXO] Dados do cliente ${clienteId} recuperados. Contato Liberado: ${
          dados.contato_liberado ? 'Sim' : 'Não'
        }.`,
      );
      return res.json(dados);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na consulta de dados de cliente para o prestador ${prestadorId}: ${
          error.message || error
        }`,
      );
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new ControllerPerfil();
