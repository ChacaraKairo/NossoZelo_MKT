import { RequestHandler } from 'express';
import logger from '../lib/logger';
import { UsuarioAutenticado } from './autenticacao';

type RequestComUsuario = Parameters<RequestHandler>[0] & {
  user?: UsuarioAutenticado;
};

export function permitirTipos(
  tiposPermitidos: string[],
): RequestHandler {
  return (req, res, next) => {
    const authReq = req as RequestComUsuario;
    const tipo = authReq.user?.tipo;

    if (!tipo) {
      logger.warn('permitirTipos: tipo nao identificado', {
        rota: req.originalUrl,
        usuarioId: authReq.user?.id,
      });
      return res
        .status(401)
        .json({ error: 'Tipo de usuario nao identificado.' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      logger.warn('permitirTipos: acesso negado por tipo', {
        rota: req.originalUrl,
        usuarioId: authReq.user?.id,
        tipo,
        tiposPermitidos,
      });
      return res
        .status(403)
        .json({ error: 'Acesso negado para este tipo de usuario.' });
    }

    return next();
  };
}
