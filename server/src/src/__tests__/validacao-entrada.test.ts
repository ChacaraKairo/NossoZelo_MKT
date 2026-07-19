import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { validarEntrada } from '../middleware/validacaoEntrada';
import {
  agendamentoCriarSchema,
  assinaturaSchema,
  loginSchema,
} from '../validator/schemas/rotasSensiveis';

function appComValidacao(schema: Parameters<typeof validarEntrada>[0]) {
  const app = express();
  app.use(express.json());
  app.post('/teste', validarEntrada(schema), (req, res) =>
    res.status(200).json({ body: req.body }),
  );
  return app;
}

describe('validacao de entrada', () => {
  it('rejeita campo inesperado em login', async () => {
    const response = await request(appComValidacao(loginSchema))
      .post('/teste')
      .send({
        identificador: 'user@test.com',
        senha: 'senha',
        role: 'admin',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Erro de validacao',
        message: 'Dados enviados invalidos.',
      }),
    );
    expect(response.body.details[0].campo).toBe('payload');
  });

  it('normaliza planoId numerico em assinatura e rejeita extras', async () => {
    const valido = await request(appComValidacao(assinaturaSchema))
      .post('/teste')
      .send({ planoId: '2', dadosPagamento: { metodoPagamento: 'pix' } });

    expect(valido.status).toBe(200);
    expect(valido.body.body.planoId).toBe(2);

    const invalido = await request(appComValidacao(assinaturaSchema))
      .post('/teste')
      .send({ planoId: 2, admin: true });

    expect(invalido.status).toBe(400);
    expect(invalido.body.details[0].campo).toBe('payload');
  });

  it('rejeita campos inesperados em criacao de agendamento', async () => {
    const response = await request(appComValidacao(agendamentoCriarSchema))
      .post('/teste')
      .send({
        prestador_id: 'prestador-1',
        servico_id: 1,
        data: '2026-07-10',
        hora_inicio: '09:00',
        prioridade_interna: true,
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].campo).toBe('payload');
  });
});
