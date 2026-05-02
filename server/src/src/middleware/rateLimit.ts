import { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  janelaMs: number;
  max: number;
  nome: string;
};

type RegistroRateLimit = {
  tentativas: number;
  resetEm: number;
};

const buckets = new Map<string, RegistroRateLimit>();

function chaveRequisicao(req: Request, nome: string) {
  const ip =
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'ip_desconhecido';

  return `${nome}:${String(ip).split(',')[0].trim()}`;
}

export function rateLimit(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const agora = Date.now();
    const chave = chaveRequisicao(req, options.nome);
    const atual = buckets.get(chave);

    if (!atual || atual.resetEm <= agora) {
      buckets.set(chave, {
        tentativas: 1,
        resetEm: agora + options.janelaMs,
      });
      return next();
    }

    if (atual.tentativas >= options.max) {
      const retryAfter = Math.ceil((atual.resetEm - agora) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        error: 'Muitas tentativas. Tente novamente em instantes.',
      });
    }

    atual.tentativas += 1;
    buckets.set(chave, atual);
    return next();
  };
}

