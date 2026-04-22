/**
 * @author Kairo Chácara & ZeloArchitect AI
 * @version 1.1
 * @date 22/04/2026
 * @description Controller para gestão de perfis.
 * Corrigido erro de tipagem no acesso aos dados de contato.
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
   * Recupera o perfil completo do usuário autenticado (Dashboard).
   */
  async obterMeuPerfil(req: AuthRequest, res: Response) {
    console.log(
      `[LOG-FLUXO] Controller: Iniciando obterMeuPerfil.`,
    );

    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          error:
            'Não autorizado: Token inválido ou ausente.',
        });
      }

      // Chama o Service que agora traz Agenda, Serviços e Avaliações inclusos
      const perfil =
        await ServicePerfil.obterMeuPerfilCompleto(
          usuarioId,
        );

      return res.json(perfil);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em obterMeuPerfil: ${error.message}`,
      );
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Atualiza dados parciais do perfil do usuário logado.
   */
  async atualizarDadosPerfil(
    req: AuthRequest,
    res: Response,
  ) {
    console.log(
      `[LOG-FLUXO] Controller: Iniciando atualizarDadosPerfil.`,
    );
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res
          .status(401)
          .json({
            error:
              'Não autorizado: Token inválido ou ausente.',
          });
      }

      const dados = req.body;
      if (!dados || Object.keys(dados).length === 0) {
        return res
          .status(400)
          .json({
            error:
              'Nenhum dado fornecido para atualização.',
          });
      }

      const perfilAtualizado =
        await ServicePerfil.atualizarDadosPerfil(
          usuarioId,
          dados,
        );
      return res.json(perfilAtualizado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em atualizarDadosPerfil: ${error.message}`,
      );
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Retorna a vitrine pública de um prestador.
   */
  async vitrinePrestador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const vitrine =
        await ServicePerfil.obterVitrinePrestador(id);
      return res.json(vitrine);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em vitrinePrestador: ${error.message}`,
      );
      return res
        .status(404)
        .json({ error: 'Prestador não encontrado' });
    }
  }

  /**
   * BUG FIX: Corrigido o acesso à propriedade 'contato_liberado'
   */
  async dadosClienteParaPrestador(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const clienteId = req.params.id;
      const prestadorId = req.user?.id;

      if (!prestadorId) {
        return res
          .status(401)
          .json({ error: 'Não autorizado' });
      }

      console.log(
        `[LOG-FLUXO] Buscando dados do cliente ${clienteId} para o prestador ${prestadorId}`,
      );

      // Aguarda o retorno do Service
      const dados =
        await ServicePerfil.obterDadosClienteParaPrestador(
          clienteId,
          prestadorId,
        );

      // Se o service não retornar dados (ex: sem permissão), retorna 404.
      if (!dados) {
        return res
          .status(404)
          .json({ error: 'Dados não localizados.' });
      }

      // Log de telemetria atualizado para evitar erro de compilação
      console.log(
        `[LOG-FLUXO] Resposta enviada. Contato Liberado: ${
          (dados as any).contato_liberado ? 'SIM' : 'NÃO'
        }`,
      );

      return res.json(dados);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em dadosClienteParaPrestador: ${error.message}`,
      );
      return res.status(400).json({ error: error.message });
    }
  }
}

// Exportamos uma instância da classe para manter o padrão singleton
export default new ControllerPerfil();
