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

function usarUpstash() {
  return (process.env.RATE_LIMIT_STORE || '').trim().toLowerCase() === 'upstash';
}

function upstashConfigurado() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function chaveRequisicao(req: Request, nome: string) {
  const ip =
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    'ip_desconhecido';

  return `${nome}:${String(ip).split(',')[0].trim()}`;
}

export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const agora = Date.now();
    const chave = chaveRequisicao(req, options.nome);

    if (usarUpstash()) {
      try {
        const resultado = await rateLimitUpstash(chave, options);
        if (resultado.bloqueado) {
          res.setHeader('Retry-After', String(resultado.retryAfter));
          return res.status(429).json({
            error: 'Muitas tentativas. Tente novamente em instantes.',
          });
        }

        return next();
      } catch {
        return res.status(503).json({
          error: 'Rate limit indisponivel. Tente novamente em instantes.',
        });
      }
    }

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

async function comandoUpstash<T>(comando: unknown[]): Promise<T> {
  if (!upstashConfigurado()) {
    throw new Error('Upstash Redis nao configurado para rate limit.');
  }

  const baseUrl = String(process.env.UPSTASH_REDIS_REST_URL).replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([comando]),
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar Upstash Redis.');
  }

  const [item] = (await response.json()) as Array<{ result?: T; error?: string }>;
  if (item?.error) throw new Error(item.error);
  return item?.result as T;
}

async function rateLimitUpstash(
  chave: string,
  options: RateLimitOptions,
): Promise<{ bloqueado: boolean; retryAfter: number }> {
  const redisKey = `rl:${chave}`;
  const tentativas = Number(await comandoUpstash<number>(['INCR', redisKey]));

  if (tentativas === 1) {
    await comandoUpstash<number>(['PEXPIRE', redisKey, options.janelaMs]);
  }

  if (tentativas <= options.max) {
    return { bloqueado: false, retryAfter: 0 };
  }

  const ttlMs = Number(await comandoUpstash<number>(['PTTL', redisKey]));
  return {
    bloqueado: true,
    retryAfter: Math.max(1, Math.ceil(ttlMs / 1000)),
  };
}
