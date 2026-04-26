import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { perfilClienteMock, perfilPrestadorMock } from '../mocks/perfilMock';
import DashboardPage from '@/pages/dashboard';

const useMeuPerfilMock = vi.hoisted(() => vi.fn());

vi.mock('@/utils/withAuth', () => ({
  withAuth: (Component: any) => Component,
}));

vi.mock('@/hooks/useMeuPerfil', () => ({
  useMeuPerfil: useMeuPerfilMock,
}));

vi.mock('@/components/header/HeaderMain', () => ({
  default: () => <header>Header</header>,
}));

vi.mock('@/components/footer/Footer', () => ({
  default: () => <footer>Footer</footer>,
}));

describe('Dashboard', () => {
  it('renderiza versao de cliente', () => {
    useMeuPerfilMock.mockReturnValue({
      perfil: perfilClienteMock,
      loading: false,
      error: null,
      recarregarPerfil: vi.fn(),
      isCliente: true,
      isPrestador: false,
      tipoUsuario: 'cliente',
    });

    render(<DashboardPage />);

    expect(screen.getByText(/Buscar prestadores/i)).toBeInTheDocument();
  });

  it('renderiza versao de prestador', () => {
    useMeuPerfilMock.mockReturnValue({
      perfil: perfilPrestadorMock,
      loading: false,
      error: null,
      recarregarPerfil: vi.fn(),
      isCliente: false,
      isPrestador: true,
      tipoUsuario: 'cuidador',
    });

    render(<DashboardPage />);

    expect(screen.getAllByText(/Solicita/i).length).toBeGreaterThan(0);
  });
});
