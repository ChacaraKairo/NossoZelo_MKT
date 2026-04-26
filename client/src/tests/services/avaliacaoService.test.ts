import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiMock } from '../mocks/apiMock';

vi.mock('@/service/api', () => ({
  default: apiMock,
  extrairErroApi: vi.fn(() => ({ status: 400, mensagem: 'erro' })),
}));

describe('avaliacaoService', () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
  });

  it('listarPorPrestador chama GET /avaliacoes/prestador/:id', async () => {
    const { avaliacaoService } = await import('@/service/avaliacaoService');
    apiMock.get.mockResolvedValue({ data: [] });

    await avaliacaoService.listarPorPrestador('prestador-1');

    expect(apiMock.get).toHaveBeenCalledWith(
      '/avaliacoes/prestador/prestador-1',
    );
  });

  it('registrarAvaliacao chama POST /avaliacoes', async () => {
    const { avaliacaoService } = await import('@/service/avaliacaoService');
    apiMock.post.mockResolvedValue({ data: { id: 1 } });

    await avaliacaoService.registrarAvaliacao({
      contratacao_id: 1,
      prestador_id: 'prestador-1',
      nota: 5,
    });

    expect(apiMock.post).toHaveBeenCalledWith(
      '/avaliacoes',
      expect.objectContaining({ contratacao_id: 1, nota: 5 }),
    );
  });
});
