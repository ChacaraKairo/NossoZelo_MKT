import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

describe('extrairMensagemErro', () => {
  it('prioriza response.data.error', () => {
    const error = new axios.AxiosError('falha');
    error.response = {
      data: { error: 'Erro de regra' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    expect(extrairMensagemErro(error)).toBe('Erro de regra');
  });

  it('usa response.data.erro quando existir', () => {
    const error = new axios.AxiosError('falha');
    error.response = {
      data: { erro: 'Erro legado' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };

    expect(extrairMensagemErro(error)).toBe('Erro legado');
  });

  it('usa message do backend ou mensagem padrao', () => {
    expect(extrairMensagemErro(new Error('Erro local'))).toBe(
      'Erro local',
    );
    expect(extrairMensagemErro(null)).toBe(
      'Ocorreu um erro inesperado.',
    );
  });
});
