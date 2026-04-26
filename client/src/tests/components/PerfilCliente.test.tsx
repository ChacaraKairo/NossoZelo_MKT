import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PerfilCliente from '@/components/perfil/PerfilCliente';
import { perfilClienteMock } from '../mocks/perfilMock';

vi.mock('@/components/perfil/AbaHistoricoPerfil', () => ({
  default: () => <section>Historico mockado para teste</section>,
}));

vi.mock('@/components/perfil/AbaSeguranca', () => ({
  default: () => <section>Seguranca mockada para teste</section>,
}));

describe('PerfilCliente', () => {
  it('renderiza dados pessoais reais recebidos por props', () => {
    render(<PerfilCliente perfil={perfilClienteMock} />);

    expect(screen.getAllByText('Cliente Teste').length).toBeGreaterThan(0);
    expect(screen.getByText(/Indaiatuba/)).toBeInTheDocument();
    expect(screen.queryByText(/COREN/i)).not.toBeInTheDocument();
  });

  it('mostra estado vazio quando nao ha contratacoes', async () => {
    render(<PerfilCliente perfil={perfilClienteMock} abaInicial="contratacoes" />);

    expect(
      await screen.findByText(/Nenhuma contrata/i),
    ).toBeInTheDocument();
  });
});
