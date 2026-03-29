import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'sua-chave-secreta';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, JWT_SECRET);
    (req as any).user = decoded;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'Token inválido ou expirado' });
  }
}
