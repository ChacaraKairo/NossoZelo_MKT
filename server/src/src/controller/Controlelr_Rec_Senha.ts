import { Request, Response } from 'express';
import ServiceRecuperacaoSenha from '../service/Service_Rec_Senha';

export class RecuperacaoSenhaController {
  static async enviarEmail(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const resultado =
        await ServiceRecuperacaoSenha.enviarEmailRecuperacao(
          email,
        );
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({
        erro:
          error.message ||
          'Erro ao enviar e-mail de recuperação',
      });
    }
  }
}
