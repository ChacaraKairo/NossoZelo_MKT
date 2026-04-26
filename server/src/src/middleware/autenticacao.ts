import { Request, Response, NextFunction } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import logger from '../lib/logger';

export type UsuarioAutenticado = {
  id: string;
  nome?: string;
  email?: string;
  tipo: string;
  iat?: number;
  exp?: number;
};

type AuthenticatedRequest = Request & {
  user?: UsuarioAutenticado;
};

function obterJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET nao configurado. Defina a variavel de ambiente antes de iniciar o servidor.',
    );
  }

  return jwtSecret;
}

function extrairBearerToken(authHeader?: string) {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}

function payloadValido(
  decoded: string | JwtPayload,
): decoded is JwtPayload & UsuarioAutenticado {
  return (
    typeof decoded === 'object' &&
    typeof decoded.id === 'string' &&
    typeof decoded.tipo === 'string'
  );
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authReq = req as AuthenticatedRequest;
  const token = extrairBearerToken(req.headers.authorization);

  if (!token) {
    logger.warn('authMiddleware: token ausente ou mal formatado', {
      rota: req.originalUrl,
      ip: req.ip,
    });
    return res
      .status(401)
      .json({ error: 'Token nao fornecido ou mal formatado.' });
  }

  try {
    const decoded = verify(token, obterJwtSecret());

    if (!payloadValido(decoded)) {
      logger.warn('authMiddleware: payload JWT invalido', {
        rota: req.originalUrl,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ error: 'Token invalido ou expirado.' });
    }

    authReq.user = {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      tipo: decoded.tipo,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    logger.debug('authMiddleware: usuario autenticado', {
      rota: req.originalUrl,
      usuarioId: authReq.user.id,
      tipo: authReq.user.tipo,
    });

    return next();
  } catch (error: any) {
    logger.warn('authMiddleware: falha ao validar JWT', {
      rota: req.originalUrl,
      ip: req.ip,
      erro: error?.name || 'JwtError',
    });

    return res
      .status(401)
      .json({ error: 'Token invalido ou expirado.' });
  }
}
