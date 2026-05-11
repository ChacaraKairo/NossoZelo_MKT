import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const prisma = {
    usuarios: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    contratacoes: {
      findUnique: vi.fn(),
    },
    avaliacoes: {
      findFirst: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  };

  return {
    prisma,
    servicePerfil: {
      atualizarMediaAvaliacao: vi.fn(),
    },
  };
});

vi.mock('../lib/prisma', () => ({ default: mocks.prisma }));
vi.mock('../service/Service_Perfil', () => ({
  ServicePerfil: mocks.servicePerfil,
}));

import ServiceAvaliacao from '../service/Service_Avaliacao';
import { calcularCancelamentoMvp } from '../service/Service_Agendamento';

function dataServico(data: string, horaFim = '12:00') {
  const [hora, minuto] = horaFim.split(':').map(Number);
  return {
    id: 1,
    cliente_id: 'cli_1',
    prestador_id: 'pro_1',
    tipo_prestador: 'cuidador',
    data: new Date(`${data}T00:00:00.000Z`),
    hora_inicio: new Date(Date.UTC(1970, 0, 1, 10, 0, 0)),
    hora_fim: new Date(Date.UTC(1970, 0, 1, hora, minuto, 0)),
    preco: 200,
    status: 'confirmado',
    observacoes: null,
    cancelado_por: null,
    motivo_cancelamento: null,
    cancelado_em: null,
    cancelamento_tardio: false,
    nao_realizado_motivo: null,
    nao_realizado_em: null,
  } as any;
}

describe('avaliacoes bilaterais', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T13:00:00.000Z'));
    vi.clearAllMocks();
    mocks.prisma.usuarios.findUnique.mockResolvedValue({
      email_confirmado: true,
    });
    mocks.prisma.avaliacoes.findFirst.mockResolvedValue(null);
    mocks.prisma.avaliacoes.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 10, ...data }),
    );
    mocks.prisma.avaliacoes.aggregate.mockResolvedValue({
      _avg: { nota: 5 },
    });
  });

  it('cliente nao avalia antes da data e hora final do servico', async () => {
    mocks.prisma.contratacoes.findUnique.mockResolvedValue(
      dataServico('2026-05-09', '15:00'),
    );

    await expect(
      ServiceAvaliacao.registrarAvaliacao(
        { contratacao_id: 1, nota: 5 },
        { id: 'cli_1', tipo: 'cliente' },
      ),
    ).rejects.toThrow(
      'A avaliacao ficara disponivel apos a data e horario final do servico.',
    );
  });

  it('cliente avalia prestador depois do horario final', async () => {
    mocks.prisma.contratacoes.findUnique.mockResolvedValue(
      dataServico('2026-05-09', '12:00'),
    );

    const resposta = await ServiceAvaliacao.registrarAvaliacao(
      { contratacao_id: 1, nota: 5, comentario: 'Muito bom' },
      { id: 'cli_1', tipo: 'cliente' },
    );

    expect(resposta.avaliacao.tipo_avaliacao).toBe(
      'cliente_para_prestador',
    );
    expect(resposta.avaliacao.autor_id).toBe('cli_1');
    expect(resposta.avaliacao.avaliado_id).toBe('pro_1');
    expect(mocks.servicePerfil.atualizarMediaAvaliacao).toHaveBeenCalledWith(
      'pro_1',
    );
  });

  it('prestador avalia cliente depois do horario final', async () => {
    mocks.prisma.contratacoes.findUnique.mockResolvedValue(
      dataServico('2026-05-09', '12:00'),
    );

    const resposta = await ServiceAvaliacao.registrarAvaliacao(
      { contratacao_id: 1, nota: 4 },
      { id: 'pro_1', tipo: 'cuidador' },
    );

    expect(resposta.avaliacao.tipo_avaliacao).toBe(
      'prestador_para_cliente',
    );
    expect(resposta.avaliacao.autor_id).toBe('pro_1');
    expect(resposta.avaliacao.avaliado_id).toBe('cli_1');
    expect(mocks.prisma.usuarios.update).toHaveBeenCalled();
  });

  it('impede avaliacao duplicada do mesmo autor', async () => {
    mocks.prisma.contratacoes.findUnique.mockResolvedValue(
      dataServico('2026-05-09', '12:00'),
    );
    mocks.prisma.avaliacoes.findFirst.mockResolvedValue({ id: 99 });

    await expect(
      ServiceAvaliacao.registrarAvaliacao(
        { contratacao_id: 1, nota: 5 },
        { id: 'cli_1', tipo: 'cliente' },
      ),
    ).rejects.toThrow('Voce ja enviou sua avaliacao');
  });

  it('terceiro nao avalia contratacao alheia', async () => {
    mocks.prisma.contratacoes.findUnique.mockResolvedValue(
      dataServico('2026-05-09', '12:00'),
    );

    await expect(
      ServiceAvaliacao.registrarAvaliacao(
        { contratacao_id: 1, nota: 5 },
        { id: 'outro', tipo: 'cliente' },
      ),
    ).rejects.toThrow(
      'Apenas cliente e profissional deste atendimento podem avaliar.',
    );
  });
});

describe('cancelamento sem custo no MVP', () => {
  it('permite cancelamento com mais de 36h sem multa nem cobranca da plataforma', () => {
    const politica = calcularCancelamentoMvp(
      dataServico('2026-05-11', '12:00'),
      new Date('2026-05-09T10:00:00.000Z'),
    );

    expect(politica.pode_cancelar).toBe(true);
    expect(politica.aplica_multa).toBe(false);
    expect(politica.valor_multa).toBe(0);
    expect(politica.houve_cobranca_plataforma).toBe(false);
    expect(politica.cancelamento_tardio).toBe(false);
  });

  it('cancelamento dentro de 36h fica registrado como tardio, sem multa', () => {
    const politica = calcularCancelamentoMvp(
      dataServico('2026-05-10', '12:00'),
      new Date('2026-05-09T16:00:00.000Z'),
    );

    expect(politica.pode_cancelar).toBe(true);
    expect(politica.aplica_multa).toBe(false);
    expect(politica.valor_multa).toBe(0);
    expect(politica.houve_cobranca_plataforma).toBe(false);
    expect(politica.cancelamento_tardio).toBe(true);
  });

  it('nao permite cancelamento normal de servico ja iniciado', () => {
    const politica = calcularCancelamentoMvp(
      dataServico('2026-05-09', '12:00'),
      new Date('2026-05-09T13:00:00.000Z'),
    );

    expect(politica.pode_cancelar).toBe(false);
    expect(politica.motivo).toContain('marcar como nao realizado');
  });
});
