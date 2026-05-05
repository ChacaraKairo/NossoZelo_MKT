import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import path from 'path';
import { verificarArquivoSeguro } from '../lib/uploadScanner';

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

const ASSINATURAS_PERMITIDAS = [
  {
    mime: 'image/jpeg',
    extensoes: ['.jpg', '.jpeg'],
    maxBytes: 5 * 1024 * 1024,
    valida: (buffer: Buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    mime: 'image/png',
    extensoes: ['.png'],
    maxBytes: 5 * 1024 * 1024,
    valida: (buffer: Buffer) =>
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: 'image/webp',
    extensoes: ['.webp'],
    maxBytes: 5 * 1024 * 1024,
    valida: (buffer: Buffer) =>
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  {
    mime: 'application/pdf',
    extensoes: ['.pdf'],
    maxBytes: 10 * 1024 * 1024,
    valida: (buffer: Buffer) => buffer.subarray(0, 5).toString('ascii') === '%PDF-',
  },
];

function nomeSuspeito(nome: string) {
  return /[\\/:*?"<>|\x00]/.test(nome) || nome.includes('..') || nome.trim().length > 180;
}

export async function validarArquivosUploadCadastro(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const arquivosPorCampo = req.files as
    | Record<string, Express.Multer.File[]>
    | undefined;
  const arquivos = Object.values(arquivosPorCampo || {}).flat();

  for (const arquivo of arquivos) {
    const extensao = path.extname(arquivo.originalname || '').toLowerCase();

    if (nomeSuspeito(arquivo.originalname || '') || extensao === '.svg') {
      return res.status(400).json({ error: 'Nome ou extensao de arquivo invalida.' });
    }

    const regra = ASSINATURAS_PERMITIDAS.find(
      (item) => item.mime === arquivo.mimetype && item.extensoes.includes(extensao),
    );

    if (!regra || arquivo.size > regra.maxBytes || !regra.valida(arquivo.buffer)) {
      return res.status(400).json({ error: 'Arquivo invalido ou nao permitido.' });
    }
  }

  try {
    for (const arquivo of arquivos) {
      const resultado = await verificarArquivoSeguro(arquivo);
      if (!resultado.seguro) {
        return res.status(400).json({
          error: 'Arquivo rejeitado pela verificacao de seguranca.',
        });
      }
    }

    return next();
  } catch {
    return res.status(503).json({
      error: 'Nao foi possivel verificar a seguranca do arquivo.',
    });
  }
}
