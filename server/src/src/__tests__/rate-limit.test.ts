import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { rateLimit } from '../middleware/rateLimit';

function appComRateLimit(nome: string) {
  const app = express();
  app.get(
    '/limitado',
    rateLimit({
      nome,
      janelaMs: 60_000,
      max: 1,
    }),
    (_req, res) => res.status(200).json({ ok: true }),
  );
  return app;
}

describe('rateLimit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.RATE_LIMIT_STORE;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('retorna 429 quando excede o limite em memoria', async () => {
    process.env.RATE_LIMIT_STORE = 'memory';
    const app = appComRateLimit(`memoria-${Date.now()}`);

    await request(app).get('/limitado').expect(200);
    const bloqueado = await request(app).get('/limitado').expect(429);

    expect(bloqueado.body).toEqual({
      error: 'Muitas tentativas. Tente novamente em instantes.',
    });
    expect(bloqueado.headers['retry-after']).toBeDefined();
  });

  it('retorna 429 quando o limite distribuido do Upstash e excedido', async () => {
    process.env.RATE_LIMIT_STORE = 'upstash';
    process.env.UPSTASH_REDIS_REST_URL = 'https://upstash.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token-de-teste';

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 1 }]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 1 }]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 2 }]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ result: 10_000 }]), { status: 200 }),
      );

    const app = appComRateLimit(`upstash-${Date.now()}`);

    await request(app).get('/limitado').expect(200);
    const bloqueado = await request(app).get('/limitado').expect(429);

    expect(bloqueado.body).toEqual({
      error: 'Muitas tentativas. Tente novamente em instantes.',
    });
    expect(bloqueado.headers['retry-after']).toBe('10');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
