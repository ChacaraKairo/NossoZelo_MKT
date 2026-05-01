import { Request, Response } from 'express';
import ServiceRecuperacaoSenha from '../service/Service_RecuperacaoSenha';

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

class RecuperacaoSenhaController {
  static async enviarEmail(req: Request, res: Response) {
    try {
      const resultado =
        await ServiceRecuperacaoSenha.enviarEmailRecuperacao(req.body?.email);

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message || 'Erro ao solicitar recuperacao.' });
    }
  }

  static async validarToken(req: Request, res: Response) {
    try {
      const resultado =
        await ServiceRecuperacaoSenha.validarTokenRecuperacao(
          String(req.query.token || ''),
        );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message || 'Token invalido.' });
    }
  }

  static async redefinirSenha(req: Request, res: Response) {
    try {
      const { token, novaSenha } = req.body || {};
      const resultado = await ServiceRecuperacaoSenha.redefinirSenha(
        token,
        novaSenha,
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: error.message || 'Erro ao redefinir senha.' });
    }
  }
}

export default RecuperacaoSenhaController;
