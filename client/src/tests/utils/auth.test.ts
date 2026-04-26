import { describe, expect, it } from 'vitest';
import { getToken, getUsuarioDoCookie } from '@/utils/auth';

function tokenTeste(payload: Record<string, unknown>) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.assinatura`;
}

describe('auth utils', () => {
  it('consegue ler token quando existente', () => {
    document.cookie = 'token=abc123; path=/';

    expect(getToken()).toBe('abc123');
  });

  it('retorna undefined quando nao ha token', () => {
    expect(getToken()).toBeUndefined();
  });

  it('decodifica usuario valido do cookie', () => {
    document.cookie = `zelo_token=${tokenTeste({
      id: 'usuario-1',
      nome: 'Usuario',
      tipo: 'cliente',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })}; path=/`;

    expect(getUsuarioDoCookie()).toMatchObject({
      id: 'usuario-1',
      tipo: 'cliente',
    });
  });
});
