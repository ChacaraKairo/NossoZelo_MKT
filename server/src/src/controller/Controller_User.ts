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
  ): Promise<void> {    try {
      const {
        usuario,
        enfermeiro,
        cuidador,
        acompanhante,
        admin,
      } = req.body;      if (!usuario || !usuario.email || !usuario.senha) {        res.status(400).json({
          message:
            'Dados de usuário incompletos. E-mail e senha são obrigatórios.',
        });
        return;
      }

      if (!usuario.tipo) {        res.status(400).json({
          message:
            'O tipo de usuário é obrigatório (ex: cuidador, enfermeiro, cliente).',
        });
        return;
      }  const novoUsuario =
        await ServiceUser.criarUsuarioComTipo({
          usuario,
          enfermeiro,
          cuidador,
          acompanhante,
          admin,
        });      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        data: novoUsuario,
      });    } catch (error: any) {      // 4. Tratamento Inteligente de Erros
      const mensagemErro =
        error.message || 'Erro interno ao criar usuário.';

      const statusCode =
        typeof error.status === 'number'
          ? error.status
          : mensagemErro.includes('obrigat') ||
              mensagemErro.includes('inv')
            ? 400
            : 500;      res
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
    const { id } = req.params;    try {      const usuario =
        await ServiceUser.buscarUsuarioCompleto(id);      res.status(200).json(usuario);
    } catch (error: any) {      res.status(404).json({ message: error.message });
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
    const { id } = req.params;    try {      const usuarioAtualizado =
        await ServiceUser.atualizarUsuario(id, req.body);      res.status(200).json(usuarioAtualizado);
    } catch (error: any) {      res.status(400).json({ message: error.message });
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
    const { novaSenha } = req.body;    try {      await ServiceUser.atualizarSenha(id, novaSenha);      res
        .status(200)
        .json({ message: 'Senha atualizada com sucesso!' });
    } catch (error: any) {      res.status(400).json({ message: error.message });
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
    const { id } = req.params;    try {      await ServiceUser.deletarUsuario(id);      res
        .status(200)
        .json({ message: 'Usuário removido do sistema.' });
    } catch (error: any) {      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
