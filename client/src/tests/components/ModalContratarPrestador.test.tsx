import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModalContratarPrestador from '@/components/prestador/ModalContratarPrestador';

const contratacaoServiceMock = vi.hoisted(() => ({
  solicitarContratacao: vi.fn(),
}));

vi.mock('@/service/contratacaoService', () => ({
  contratacaoService: contratacaoServiceMock,
}));

vi.mock('@/utils/auth', () => ({
  getUsuarioDoCookie: vi.fn(() => ({ id: 'cliente-1', tipo: 'cliente' })),
}));

const props = {
  aberto: true,
  prestadorId: 'prestador-1',
  tipoPrestador: 'cuidador',
  servicos: [{ id: 1, nome: 'Acompanhamento', valor: 120 }],
  onClose: vi.fn(),
};

describe('ModalContratarPrestador', () => {
  beforeEach(() => {
    contratacaoServiceMock.solicitarContratacao.mockReset();
  });

  it('exige data, horario, servico e confirmacao', () => {
    render(<ModalContratarPrestador {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    expect(screen.getByText(/Informe a data desejada/i)).toBeInTheDocument();
  });

  it('chama contratacaoService.solicitarContratacao no envio valido', async () => {
    contratacaoServiceMock.solicitarContratacao.mockResolvedValue({ id: 1 });
    render(<ModalContratarPrestador {...props} />);

    fireEvent.change(screen.getByLabelText(/Data desejada/i), {
      target: { value: '2026-05-10' },
    });
    fireEvent.change(screen.getByLabelText(/Hor/i), {
      target: { value: '10:00' },
    });
    fireEvent.change(screen.getByLabelText(/Servi/i), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByLabelText(/Confirmo/i));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));

    await waitFor(() =>
      expect(contratacaoServiceMock.solicitarContratacao).toHaveBeenCalledWith(
        expect.objectContaining({
          prestador_id: 'prestador-1',
          servico_id: 1,
          data: '2026-05-10',
        }),
      ),
    );
  });
});
