import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PerfilPrestador from '@/components/perfil/PerfilPrestador';
import { perfilPrestadorMock } from '../mocks/perfilMock';

vi.mock('@/components/perfil/AbaHistoricoPerfil', () => ({
  default: () => <section>Historico mockado para teste</section>,
}));

vi.mock('@/components/perfil/AbaSeguranca', () => ({
  default: () => <section>Seguranca mockada para teste</section>,
}));

vi.mock('@/components/perfil/AbaServicosOperacionais', () => ({
  default: () => <section>Servicos operacionais mockados</section>,
}));

const contratacaoServiceMock = vi.hoisted(() => ({
  listarSolicitacoesPrestador: vi.fn().mockResolvedValue([
    {
      id: 7,
      cliente_id: 'cliente-1',
      prestador_id: 'prestador-1',
      status: 'pendente',
      data: '2026-05-10T00:00:00.000Z',
      servico_id: 1,
      usuarios_contratacoes_cliente_idTousuarios: {
        nome: 'Cliente Teste',
      },
    },
  ]),
  atualizarStatusContratacao: vi.fn(),
}));

vi.mock('@/service/contratacaoService', () => ({
  contratacaoService: contratacaoServiceMock,
}));

describe('PerfilPrestador', () => {
  it('renderiza servicos, agenda, avaliacoes e solicitacoes', () => {
    render(<PerfilPrestador perfil={perfilPrestadorMock} />);

    expect(screen.getAllByText('Prestador Teste').length).toBeGreaterThan(0);
    expect(screen.getByText(/Pedidos pendentes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Contrata/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Avalia/i).length).toBeGreaterThan(0);
  });
});
