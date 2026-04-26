import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AbaSolicitacoesPro from '@/components/perfil/AbaSolicitacoesPro';
import { perfilPrestadorMock } from '../mocks/perfilMock';

const contratacaoServiceMock = vi.hoisted(() => ({
  listarSolicitacoesPrestador: vi.fn(),
  atualizarStatusContratacao: vi.fn(),
}));

vi.mock('@/service/contratacaoService', () => ({
  contratacaoService: contratacaoServiceMock,
}));

describe('AbaSolicitacoesPro', () => {
  beforeEach(() => {
    contratacaoServiceMock.listarSolicitacoesPrestador.mockResolvedValue(
      perfilPrestadorMock.contratacoes_contratacoes_prestador_idTousuarios,
    );
    contratacaoServiceMock.atualizarStatusContratacao.mockResolvedValue({
      id: 7,
      status: 'confirmado',
    });
  });

  it('mostra botao Aceitar/Negar apenas para status pendente', () => {
    render(<AbaSolicitacoesPro perfil={perfilPrestadorMock} />);

    expect(screen.getByRole('button', { name: /Aceitar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Negar/i })).toBeInTheDocument();
  });

  it('chama contratacaoService ao aceitar', async () => {
    render(<AbaSolicitacoesPro perfil={perfilPrestadorMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Aceitar/i }));

    await waitFor(() =>
      expect(
        contratacaoServiceMock.atualizarStatusContratacao,
      ).toHaveBeenCalledWith(7, 'confirmado'),
    );
  });

  it('chama contratacaoService ao negar', async () => {
    render(<AbaSolicitacoesPro perfil={perfilPrestadorMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Negar/i }));

    await waitFor(() =>
      expect(
        contratacaoServiceMock.atualizarStatusContratacao,
      ).toHaveBeenCalledWith(7, 'cancelado'),
    );
  });
});
