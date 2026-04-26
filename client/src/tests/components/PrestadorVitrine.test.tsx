import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrestadorVitrinePage from '@/pages/prestador/[id]';

const perfilServiceMock = vi.hoisted(() => ({
  obterVitrinePrestador: vi.fn(),
}));

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  query: { id: 'prestador-1' },
  isReady: true,
}));

vi.mock('next/router', () => ({
  useRouter: () => routerMock,
}));

vi.mock('@/service/perfilService', () => ({
  perfilService: perfilServiceMock,
}));

vi.mock('@/service/api', () => ({
  extrairErroApi: vi.fn((error: any) => ({
    status: error?.status,
    mensagem: error?.message || 'Erro',
  })),
}));

vi.mock('@/components/prestador/ModalContratarPrestador', () => ({
  default: ({ aberto }: { aberto: boolean }) =>
    aberto ? <div role="dialog">Modal de contratacao aberto</div> : null,
}));

describe('Vitrine do prestador', () => {
  beforeEach(() => {
    perfilServiceMock.obterVitrinePrestador.mockReset();
    routerMock.query = { id: 'prestador-1' };
    routerMock.isReady = true;
  });

  it('busca e renderiza vitrine publica sem contato privado', async () => {
    perfilServiceMock.obterVitrinePrestador.mockResolvedValue({
      id: 'prestador-1',
      nome: 'Prestador Publico',
      tipo: 'cuidador',
      cidade: 'Indaiatuba',
      estado: 'SP',
      servicos: [{ id: 1, nome: 'Acompanhamento', valor: 120 }],
      avaliacoes: [{ id: 1, nota: 5, data_avaliacao: '2026-05-10' }],
      pode_ver_contato: false,
    });

    render(<PrestadorVitrinePage />);

    expect(
      await screen.findByText('Prestador Publico'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Entrar em contato/i)).not.toBeInTheDocument();
  });

  it('mostra prestador nao encontrado quando API retorna vazio', async () => {
    perfilServiceMock.obterVitrinePrestador.mockResolvedValue(null);

    render(<PrestadorVitrinePage />);

    expect(
      await screen.findByText(/Prestador n/i),
    ).toBeInTheDocument();
  });

  it('abre modal de contratacao', async () => {
    perfilServiceMock.obterVitrinePrestador.mockResolvedValue({
      id: 'prestador-1',
      nome: 'Prestador Publico',
      tipo: 'cuidador',
      servicos: [],
      pode_ver_contato: true,
    });

    render(<PrestadorVitrinePage />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: /Solicitar/i,
      }),
    );

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument(),
    );
  });
});
