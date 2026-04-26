import { describe, expect, it } from 'vitest';
import api, { baseURL } from '@/service/api';

describe('api compartilhado', () => {
  it('usa baseURL padrao do backend NossoZelo', () => {
    expect(baseURL).toContain('/nossozelo');
  });

  it('adiciona Authorization quando ha token', async () => {
    document.cookie = 'token=token-teste; path=/';
    api.defaults.adapter = async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });

    const response = await api.get('/perfil/meu');

    expect(response.config.headers.Authorization).toBe(
      'Bearer token-teste',
    );
  });
});
