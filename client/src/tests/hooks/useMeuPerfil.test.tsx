import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { perfilClienteMock, perfilPrestadorMock } from '../mocks/perfilMock';
import { useMeuPerfil } from '@/hooks/useMeuPerfil';

const perfilServiceMock = vi.hoisted(() => ({
  obterMeuPerfil: vi.fn(),
}));

vi.mock('@/service/perfilService', () => ({
  perfilService: perfilServiceMock,
}));

describe('useMeuPerfil', () => {
  beforeEach(() => {
    perfilServiceMock.obterMeuPerfil.mockReset();
  });

  it('carrega perfil com sucesso', async () => {
    perfilServiceMock.obterMeuPerfil.mockResolvedValue(perfilClienteMock);

    const { result } = renderHook(() => useMeuPerfil());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.perfil?.id).toBe('cliente-1');
    expect(result.current.error).toBeNull();
  });

  it('identifica cliente', async () => {
    perfilServiceMock.obterMeuPerfil.mockResolvedValue(perfilClienteMock);

    const { result } = renderHook(() => useMeuPerfil());

    await waitFor(() => expect(result.current.isCliente).toBe(true));
    expect(result.current.tipoUsuario).toBe('cliente');
  });

  it('identifica prestador', async () => {
    perfilServiceMock.obterMeuPerfil.mockResolvedValue(perfilPrestadorMock);

    const { result } = renderHook(() => useMeuPerfil());

    await waitFor(() => expect(result.current.isPrestador).toBe(true));
    expect(result.current.tipoUsuario).toBe('cuidador');
  });

  it('trata erro da API', async () => {
    perfilServiceMock.obterMeuPerfil.mockRejectedValue(
      new Error('Falha de API'),
    );

    const { result } = renderHook(() => useMeuPerfil());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Falha de API');
    expect(result.current.perfil).toBeNull();
  });
});
