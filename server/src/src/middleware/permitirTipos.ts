import { RequestHandler } from 'express';
import { AuthRequest } from '../controller/Controller_Perfil';

export function permitirTipos(
  tiposPermitidos: string[],
): RequestHandler {
  return (req, res, next) => {
    const tipo = (req as AuthRequest).user?.tipo;

    if (!tipo) {
      return res
        .status(401)
        .json({ error: 'Tipo de usuário não identificado.' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      return res
        .status(403)
        .json({ error: 'Acesso negado para este tipo de usuário.' });
    }

    return next();
  };
}
