import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { authMiddleware } from '../../src/middleware/autenticacao';
import { permitirTipos } from '../../src/middleware/permitirTipos';
import { criarTokenTeste } from '../helpers/authTestHelper';
import { apiTest } from '../helpers/requestHelper';

function appProtegido() {
  const app = express();
  app.get('/protegida', authMiddleware, (_req, res) =>
    res.status(200).json({ ok: true }),
  );
  app.get(
    '/prestador',
    authMiddleware,
    permitirTipos(['cuidador', 'enfermeiro', 'acompanhante']),
    (_req, res) => res.status(200).json({ ok: true }),
  );
  return app;
}

describe('health check', () => {
  it('deve responder que a API esta saudavel', async () => {
    const response = await apiTest().get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
});

describe('authMiddleware', () => {
  it('deve bloquear requisicao sem token', async () => {
    const response = await request(appProtegido()).get('/protegida');

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });

  it('deve bloquear token invalido', async () => {
    const response = await request(appProtegido())
      .get('/protegida')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.status).toBe(401);
  });

  it('deve aceitar token valido', async () => {
    const response = await request(appProtegido())
      .get('/protegida')
      .set('Authorization', `Bearer ${criarTokenTeste()}`);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('deve rejeitar usuario sem tipo quando a rota exigir tipo', async () => {
    const token = criarTokenTeste({ tipo: undefined });

    const response = await request(appProtegido())
      .get('/prestador')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('deve rejeitar tipo nao permitido', async () => {
    const token = criarTokenTeste({ tipo: 'cliente' });

    const response = await request(appProtegido())
      .get('/prestador')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
