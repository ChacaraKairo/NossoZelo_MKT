import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

export type CadastroUploadRequest = Request & {
  cadastroUpload?: {
    usuarioId: string;
    tipo?: string;
  };
};

type UploadTokenPayload = JwtPayload & {
  id?: string;
  tipo?: string;
  purpose?: string;
};

export function validarTokenUploadCadastro(
  req: CadastroUploadRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token temporario de cadastro nao informado.',
      message: 'Token temporario de cadastro nao informado.',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      error: 'Configuracao de seguranca ausente.',
      message: 'Configuracao de seguranca ausente.',
    });
  }

  try {
    const decoded = verify(token, jwtSecret) as
      | UploadTokenPayload
      | string;

    if (
      typeof decoded === 'string' ||
      decoded.purpose !== 'cadastro_upload' ||
      !decoded.id
    ) {
      return res.status(403).json({
        error: 'Token temporario de cadastro invalido.',
        message: 'Token temporario de cadastro invalido.',
      });
    }

    req.cadastroUpload = {
      usuarioId: decoded.id,
      tipo: decoded.tipo,
    };

    return next();
  } catch {
    return res.status(401).json({
      error: 'Token temporario de cadastro expirado ou invalido.',
      message: 'Token temporario de cadastro expirado ou invalido.',
    });
  }
}
