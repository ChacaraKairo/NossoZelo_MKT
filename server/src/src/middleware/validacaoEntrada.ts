import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import logger from '../lib/logger';

type OrigemValidacao = 'body' | 'query' | 'params';

function detalhesErro(error: ZodError) {
  return error.issues.map((issue) => ({
    campo: issue.path.join('.') || 'payload',
    mensagem: issue.message,
  }));
}

export function validarEntrada(
  schema: ZodTypeAny,
  origem: OrigemValidacao = 'body',
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req[origem]);

    if (!resultado.success) {
      const details = detalhesErro(resultado.error);

      logger.warn('ValidacaoEntrada: payload rejeitado', {
        origem,
        rota: req.originalUrl,
        details,
      });

      return res.status(400).json({
        error: 'Erro de validacao',
        message: 'Dados enviados invalidos.',
        details,
      });
    }

    req[origem] = resultado.data;
    return next();
  };
}
