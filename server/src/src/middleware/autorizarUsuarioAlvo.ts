import { NextFunction, Response } from 'express';
import { permitirDonoOuAdmin } from './autorizacao';
import { AuthRequest } from '../types/auth';

export function autorizarUsuarioAlvo(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  return permitirDonoOuAdmin('id')(req, res, next);
}
