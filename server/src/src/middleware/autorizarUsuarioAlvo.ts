import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth';

export function autorizarUsuarioAlvo(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const usuarioAutenticado = req.user;
  const usuarioAlvoId = req.params.id;

  if (!usuarioAutenticado) {
    return res.status(401).json({ error: 'Usuario nao autenticado.' });
  }

  if (usuarioAutenticado.tipo === 'admin' || usuarioAutenticado.id === usuarioAlvoId) {
    return next();
  }

  return res.status(403).json({
    error: 'Voce nao tem permissao para acessar este usuario.',
  });
}
