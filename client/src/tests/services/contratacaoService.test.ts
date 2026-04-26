import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiMock } from '../mocks/apiMock';

vi.mock('@/service/api', () => ({
  default: apiMock,
  extrairErroApi: vi.fn(() => ({ status: 400, mensagem: 'erro' })),
}));

vi.mock('@/utils/auth', () => ({
  getUsuarioDoCookie: vi.fn(() => ({ id: 'usuario-1', tipo: 'cliente' })),
}));

describe('contratacaoService', () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    apiMock.patch.mockReset();
  });

  it('solicitarContratacao chama POST /agendamentos', async () => {
    const { contratacaoService } = await import(
      '@/service/contratacaoService'
    );
    apiMock.post.mockResolvedValue({ status: 201, data: { id: 1 } });

    await contratacaoService.solicitarContratacao({
      prestador_id: 'prestador-1',
      servico_id: 1,
      data: '2026-05-10',
    });

    expect(apiMock.post).toHaveBeenCalledWith(
      '/agendamentos',
      expect.objectContaining({ prestador_id: 'prestador-1' }),
    );
  });

  it('aceitar chama PATCH /agendamentos/aceitar/:id', async () => {
    const { contratacaoService } = await import(
      '@/service/contratacaoService'
    );
    apiMock.patch.mockResolvedValue({ status: 200, data: { id: 1 } });

    await contratacaoService.aceitar(1);

    expect(apiMock.patch).toHaveBeenCalledWith('/agendamentos/aceitar/1');
  });

  it('negar chama PATCH /agendamentos/cancelar/:id', async () => {
    const { contratacaoService } = await import(
      '@/service/contratacaoService'
    );
    apiMock.patch.mockResolvedValue({ status: 200, data: { id: 1 } });

    await contratacaoService.negar(1);

    expect(apiMock.patch).toHaveBeenCalledWith('/agendamentos/cancelar/1');
  });
});
