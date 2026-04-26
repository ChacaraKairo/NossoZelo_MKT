import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { perfilClienteMock } from '../mocks/perfilMock';
import { usePerfilEditor } from '@/hooks/usePerfilEditor';

const perfilServiceMock = vi.hoisted(() => ({
  atualizarDadosPerfil: vi.fn(),
}));

vi.mock('@/service/perfilService', () => ({
  perfilService: perfilServiceMock,
}));

describe('usePerfilEditor', () => {
  beforeEach(() => {
    perfilServiceMock.atualizarDadosPerfil.mockReset();
  });

  it('remove campos protegidos antes de salvar', async () => {
    perfilServiceMock.atualizarDadosPerfil.mockResolvedValue({
      ...perfilClienteMock,
      nome: 'Cliente Novo',
    });

    const { result } = renderHook(() => usePerfilEditor());

    act(() => {
      result.current.iniciarEdicao(perfilClienteMock);
      result.current.alterarCampo('nome', 'Cliente Novo');
      result.current.alterarCampo('email', 'novo@email.com');
      result.current.alterarCampo('senha', '123456');
    });

    await act(async () => {
      await result.current.salvarAlteracoes();
    });

    expect(perfilServiceMock.atualizarDadosPerfil).toHaveBeenCalledWith({
      nome: 'Cliente Novo',
    });
  });

  it('chama PATCH com payload correto', async () => {
    perfilServiceMock.atualizarDadosPerfil.mockResolvedValue({
      ...perfilClienteMock,
      cidade: 'Campinas',
    });

    const { result } = renderHook(() => usePerfilEditor());

    act(() => {
      result.current.iniciarEdicao(perfilClienteMock);
      result.current.alterarCampo('cidade', 'Campinas');
    });

    await act(async () => {
      await result.current.salvarAlteracoes();
    });

    await waitFor(() =>
      expect(perfilServiceMock.atualizarDadosPerfil).toHaveBeenCalledWith({
        cidade: 'Campinas',
      }),
    );
  });
});
