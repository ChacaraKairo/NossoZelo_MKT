import { RequestHandler } from 'express';
import logger from '../lib/logger';

export function permitirTipos(
  tiposPermitidos: string[],
): RequestHandler {
  return (req, res, next) => {
    const tipo = req.user?.tipo;

    if (!tipo) {
      logger.warn('permitirTipos: tipo não identificado', {
        rota: req.originalUrl,
        usuarioId: req.user?.id,
      });
      return res
        .status(401)
        .json({ error: 'Tipo de usuário não identificado.' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      logger.warn('permitirTipos: acesso negado por tipo', {
        rota: req.originalUrl,
        usuarioId: req.user?.id,
        tipo,
        tiposPermitidos,
      });
      return res
        .status(403)
        .json({ error: 'Acesso negado para este tipo de usuário.' });
    }

    return next();
  };
}
