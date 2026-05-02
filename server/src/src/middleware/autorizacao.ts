import { NextFunction, RequestHandler, Response } from 'express';
import { authMiddleware } from './autenticacao';
import logger from '../lib/logger';
import { AuthRequest } from '../types/auth';

const TIPOS_PRESTADOR = ['cuidador', 'enfermeiro', 'acompanhante'];

export const exigirAutenticacao = authMiddleware;

export function permitirTipos(tiposPermitidos: string[]): RequestHandler {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    const tipo = authReq.user?.tipo;

    if (!tipo) {
      return res.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      logger.warn('autorizacao: acesso negado por tipo', {
        rota: req.originalUrl,
        usuarioId: authReq.user?.id,
        tipo,
        tiposPermitidos,
      });
      return res.status(403).json({
        error: 'Acesso negado para este tipo de usuario.',
      });
    }

    return next();
  };
}

export function permitirDonoOuAdmin(paramName = 'id'): RequestHandler {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    const usuario = authReq.user;
    const alvoId = req.params[paramName];

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario nao autenticado.' });
    }

    if (usuario.tipo === 'admin' || usuario.id === alvoId) {
      return next();
    }

    return res.status(403).json({
      error: 'Voce nao tem permissao para acessar este recurso.',
    });
  };
}

export function garantirPrestadorOperacional(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const tipo = req.user?.tipo;

  if (!tipo) {
    return res.status(401).json({ error: 'Usuario nao autenticado.' });
  }

  if (!TIPOS_PRESTADOR.includes(tipo)) {
    return res.status(403).json({
      error: 'Recurso disponivel apenas para prestadores.',
    });
  }

  if (req.user?.email_confirmado === false) {
    return res.status(403).json({
      error: 'Confirme seu e-mail antes de continuar.',
    });
  }

  return next();
}
