import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { verificarArquivoSeguro } from '../lib/uploadScanner';

const ASSINATURAS_PERMITIDAS = [
  {
    mime: 'image/jpeg',
    extensoes: ['.jpg', '.jpeg'],
    maxBytes: 5 * 1024 * 1024,
    valida: (buffer: Buffer) =>
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    mime: 'image/png',
    extensoes: ['.png'],
    maxBytes: 5 * 1024 * 1024,
    valida: (buffer: Buffer) =>
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
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

export const uploadDocumentoVerificacao = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ASSINATURAS_PERMITIDAS.map((regra) => regra.mime);
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Formato nao suportado. Use JPG, PNG, WebP ou PDF.'));
  },
});

export async function validarArquivoDocumento(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const arquivo = req.file;
  if (!arquivo) {
    return res.status(400).json({ error: 'Arquivo nao informado.' });
  }

  const extensao = path.extname(arquivo.originalname || '').toLowerCase();
  const regra = ASSINATURAS_PERMITIDAS.find(
    (item) => item.mime === arquivo.mimetype && item.extensoes.includes(extensao),
  );

  if (
    nomeSuspeito(arquivo.originalname || '') ||
    extensao === '.svg' ||
    !regra ||
    arquivo.size > regra.maxBytes ||
    !regra.valida(arquivo.buffer)
  ) {
    return res.status(400).json({ error: 'Arquivo invalido ou nao permitido.' });
  }

  try {
    const resultado = await verificarArquivoSeguro(arquivo);
    if (!resultado.seguro) {
      return res.status(400).json({
        error: 'Arquivo rejeitado pela verificacao de seguranca.',
      });
    }

    return next();
  } catch {
    return res.status(503).json({
      error: 'Nao foi possivel verificar a seguranca do arquivo.',
    });
  }
}
