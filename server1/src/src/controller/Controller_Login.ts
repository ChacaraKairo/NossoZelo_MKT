import { Request, Response } from 'express';
import { ServiceAuth } from '../service/Service_Autenticacao';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { identificador, senha } = req.body;

      if (!identificador || !senha) {
        return res
          .status(400)
          .json({
            error:
              'Identificador e senha são obrigatórios.',
          });
      }

      const result = await ServiceAuth.login({
        identificador,
        senha,
      });
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}
