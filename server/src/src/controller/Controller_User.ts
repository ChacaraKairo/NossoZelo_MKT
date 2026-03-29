import { Request, Response } from 'express';
import ServiceUser from '../service/Service_User';

class UserController {
  static async criarUsuario(req: Request, res: Response) {
    try {
      const usuario = await ServiceUser.criarUsuarioComTipo(
        req.body,
      );
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
