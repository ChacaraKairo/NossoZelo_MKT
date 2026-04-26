import { Request } from 'express';

export type UsuarioAutenticado = {
  id: string;
  nome?: string;
  email?: string;
  tipo: string;
  iat?: number;
  exp?: number;
};

export type AuthRequest = Request & {
  user?: UsuarioAutenticado;
};
