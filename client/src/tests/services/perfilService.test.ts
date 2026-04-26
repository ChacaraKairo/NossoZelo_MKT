import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiMock } from '../mocks/apiMock';
import { perfilClienteMock } from '../mocks/perfilMock';

vi.mock('@/service/api', () => ({
  default: apiMock,
  extrairErroApi: vi.fn(() => ({ status: 400, mensagem: 'erro' })),
}));

describe('perfilService', () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.patch.mockReset();
  });

  it('obterMeuPerfil chama GET /perfil/meu', async () => {
    const { perfilService } = await import('@/service/perfilService');
    apiMock.get.mockResolvedValue({ data: perfilClienteMock });

    await expect(perfilService.obterMeuPerfil()).resolves.toEqual(
      perfilClienteMock,
    );

    expect(apiMock.get).toHaveBeenCalledWith('/perfil/meu');
  });

  it('atualizarDadosPerfil chama PATCH /perfil/update', async () => {
    const { perfilService } = await import('@/service/perfilService');
    apiMock.patch.mockResolvedValue({ data: perfilClienteMock });

    await perfilService.atualizarDadosPerfil({ nome: 'Novo Nome' });

    expect(apiMock.patch).toHaveBeenCalledWith('/perfil/update', {
      nome: 'Novo Nome',
    });
  });

  it('obterVitrinePrestador chama GET /perfil/prestador/:id', async () => {
    const { perfilService } = await import('@/service/perfilService');
    apiMock.get.mockResolvedValue({
      data: { id: 'prestador-1', nome: 'Prestador' },
    });

    await perfilService.obterVitrinePrestador('prestador-1');

    expect(apiMock.get).toHaveBeenCalledWith(
      '/perfil/prestador/prestador-1',
    );
  });
});
