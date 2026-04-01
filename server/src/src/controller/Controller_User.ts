// src/controllers/UserController.ts
import { Request, Response } from 'express';
import ServiceUser from '../service/Service_User';

class UserController {
  static async criarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const {
        usuario,
        enfermeiro,
        cuidador,
        acompanhante,
        admin,
      } = req.body;

      // 1. Validação Antecipada (Fail Fast)
      if (!usuario || !usuario.email || !usuario.senha) {
        res.status(400).json({
          message:
            'Dados de usuário incompletos. E-mail e senha são obrigatórios.',
        });
        return;
      }

      if (!usuario.tipo) {
        res.status(400).json({
          message:
            'O tipo de usuário é obrigatório (ex: cuidador, enfermeiro, cliente).',
        });
        return;
      }

      // 2. Chama a lógica de negócio pesada (que construímos no ServiceUser)
      const novoUsuario =
        await ServiceUser.criarUsuarioComTipo({
          usuario,
          enfermeiro,
          cuidador,
          acompanhante,
          admin,
        });

      // 3. Sucesso! Retorna 201 (Created)
      res.status(201).json({
        message: 'Usuário criado com sucesso!',
        data: novoUsuario,
      });
    } catch (error: any) {
      console.error(
        'Erro no UserController:',
        error.message,
      );

      // 4. Tratamento Inteligente de Erros
      // Se a mensagem de erro vier das nossas validações do Service (ex: "COREN obrigatório"), é um erro 400 (Bad Request).
      // Se for um erro estranho do banco de dados, é um erro 500 (Internal Server Error).
      const mensagemErro =
        error.message || 'Erro interno ao criar usuário.';
      const statusCode =
        mensagemErro.includes('obrigatório') ||
        mensagemErro.includes('inválid')
          ? 400
          : 500;

      res
        .status(statusCode)
        .json({ message: mensagemErro });
    }
  }

  // Buscar Usuário Completo (Base + Perfil)
  static async buscarUsuarioCompleto(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const usuario =
        await ServiceUser.buscarUsuarioCompleto(id);
      res.status(200).json(usuario);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  // Atualizar Dados (Exceto Senha)
  static async atualizarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioAtualizado =
        await ServiceUser.atualizarUsuario(id, req.body);
      res.status(200).json(usuarioAtualizado);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Atualizar Senha (Rota de Segurança)
  static async atualizarSenha(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { novaSenha } = req.body;
      await ServiceUser.atualizarSenha(id, novaSenha);
      res
        .status(200)
        .json({ message: 'Senha atualizada com sucesso!' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // Deletar Usuário
  static async deletarUsuario(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await ServiceUser.deletarUsuario(id);
      res
        .status(200)
        .json({ message: 'Usuário removido do sistema.' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
