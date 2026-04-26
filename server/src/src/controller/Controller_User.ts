/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP relacionadas aos usuários,
 * atuando como ponte entre as rotas Express e a lógica de negócio do ServiceUser.
 * @rota server\src\src\controller\Controller_User.ts
 */

import { Request, Response } from 'express';
import ServiceUser from '../service/Service_User';

class UserController {
  /**
   * Endpoint para criação de um novo usuário com perfil específico.
   * Realiza validação Fail-Fast antes de invocar o serviço de criação.
   * @param {Request} req - Objeto de requisição do Express contendo o payload do usuário e perfil.
   * @param {Response} res - Objeto de resposta do Express.
   * @returns {Promise<void>}
   */
  static async criarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    console.log(
      `[LOG-FLUXO] Iniciando criarUsuario no UserController para e-mail: ${
        req.body?.usuario?.email || 'N/A'
      } e tipo: ${req.body?.usuario?.tipo || 'N/A'}.`,
    );

    try {
      const {
        usuario,
        enfermeiro,
        cuidador,
        acompanhante,
        admin,
      } = req.body;

      // 1. Validação Antecipada (Fail Fast)
      console.log(
        '[LOG-FLUXO] Executando validações preliminares de obrigatoriedade.',
      );
      if (!usuario || !usuario.email || !usuario.senha) {
        console.error(
          '[ERRO-FLUXO] Falha na validação Fail-Fast: Dados de usuário, e-mail ou senha ausentes.',
        );
        res.status(400).json({
          message:
            'Dados de usuário incompletos. E-mail e senha são obrigatórios.',
        });
        return;
      }

      if (!usuario.tipo) {
        console.error(
          '[ERRO-FLUXO] Falha na validação Fail-Fast: Campo tipo de usuário não informado.',
        );
        res.status(400).json({
          message:
            'O tipo de usuário é obrigatório (ex: cuidador, enfermeiro, cliente).',
        });
        return;
      }

      console.log(
        `[LOG-FLUXO] Validações básicas concluídas. Tipo detectado: ${usuario.tipo}.`,
      );

      // 2. Chama a lógica de negócio pesada
      console.log(
        '[LOG-FLUXO] Delegando persistência para ServiceUser.criarUsuarioComTipo.',
      );
      const novoUsuario =
        await ServiceUser.criarUsuarioComTipo({
          usuario,
          enfermeiro,
          cuidador,
          acompanhante,
          admin,
        });

      // 3. Sucesso! Retorna 201 (Created)
      console.log(
        '[LOG-FLUXO] ServiceUser retornou com sucesso. Preparando resposta HTTP 201.',
      );
      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        data: novoUsuario,
      });

      console.log(
        '[LOG-FLUXO] Requisição criarUsuario finalizada com êxito.',
      );
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Exceção capturada no UserController.criarUsuario: ${error.message}`,
      );

      // 4. Tratamento Inteligente de Erros
      const mensagemErro =
        error.message || 'Erro interno ao criar usuário.';

      const statusCode =
        typeof error.status === 'number'
          ? error.status
          : mensagemErro.includes('obrigat') ||
              mensagemErro.includes('inv')
            ? 400
            : 500;

      console.log(
        `[LOG-FLUXO] Enviando resposta de erro com Status: ${statusCode}.`,
      );
      res
        .status(statusCode)
        .json({ error: mensagemErro, message: mensagemErro });
    }
  }

  /**
   * Recupera os dados completos de um usuário (Base + Perfil Satélite).
   * @param {Request} req - Requisição contendo o ID nos parâmetros da URL.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscarUsuarioCompleto(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando buscarUsuarioCompleto no UserController para o ID: ${id}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Invocando ServiceUser.buscarUsuarioCompleto para o ID: ${id}`,
      );
      const usuario =
        await ServiceUser.buscarUsuarioCompleto(id);

      console.log(
        `[LOG-FLUXO] Sucesso ao recuperar dados do usuário ${id}. Enviando Status 200.`,
      );
      res.status(200).json(usuario);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao localizar usuário ${id}: ${error.message}`,
      );
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Atualiza as informações de um usuário e seu perfil associado.
   * @param {Request} req - Payload com os novos dados no body.
   * @param {Response} res - Resposta HTTP.
   */
  static async atualizarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando atualizarUsuario no UserController para o ID: ${id}.`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando atualização ao ServiceUser para o ID: ${id}`,
      );
      const usuarioAtualizado =
        await ServiceUser.atualizarUsuario(id, req.body);

      console.log(
        `[LOG-FLUXO] Usuário ${id} atualizado com sucesso. Enviando Status 200.`,
      );
      res.status(200).json(usuarioAtualizado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na atualização do usuário ${id}: ${error.message}`,
      );
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Realiza a redefinição de senha do usuário através de rota protegida.
   * @param {Request} req - Contém novaSenha no body.
   * @param {Response} res - Resposta HTTP.
   */
  static async atualizarSenha(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    const { novaSenha } = req.body;
    console.log(
      `[LOG-FLUXO] Iniciando atualizarSenha no UserController para o ID: ${id}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Chamando ServiceUser.atualizarSenha para o ID: ${id}`,
      );
      await ServiceUser.atualizarSenha(id, novaSenha);

      console.log(
        `[LOG-FLUXO] Senha do usuário ${id} alterada com sucesso.`,
      );
      res
        .status(200)
        .json({ message: 'Senha atualizada com sucesso!' });
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao atualizar senha do usuário ${id}: ${error.message}`,
      );
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Remove permanentemente um usuário do sistema.
   * @param {Request} req - Parâmetro ID na URL.
   * @param {Response} res - Resposta HTTP.
   */
  static async deletarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando deletarUsuario no UserController para o ID: ${id}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando remoção definitiva ao ServiceUser para o ID: ${id}`,
      );
      await ServiceUser.deletarUsuario(id);

      console.log(
        `[LOG-FLUXO] Usuário ${id} removido do sistema com sucesso.`,
      );
      res
        .status(200)
        .json({ message: 'Usuário removido do sistema.' });
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro crítico ao deletar usuário ${id}: ${error.message}`,
      );
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
