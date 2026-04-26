import { describe, expect, it } from 'vitest';
import ServiceAgendamento from '../../src/service/Service_Agendamento';
import { STATUS_CONTRATACAO } from '../../src/constants/dominio';
import { prismaMock } from '../helpers/prismaMock';

const cliente = { id: 'cliente-1', tipo: 'cliente' };
const prestadorUsuario = {
  id: 'prestador-1',
  nome: 'Prestador',
  email: 'prestador@email.com',
  tipo: 'cuidador',
};
const servico = {
  id: 10,
  prestador_id: 'prestador-1',
  valor: 120,
};
const contratacaoCompleta = {
  id: 1,
  cliente_id: 'cliente-1',
  prestador_id: 'prestador-1',
  tipo_prestador: 'cuidador',
  data: new Date('2026-05-10T00:00:00Z'),
  hora_inicio: new Date(Date.UTC(1970, 0, 1, 10)),
  hora_fim: new Date(Date.UTC(1970, 0, 1, 11)),
  preco: 120,
  status: STATUS_CONTRATACAO.pendente,
  observacoes: null,
  usuarios_contratacoes_cliente_idTousuarios: {
    id: 'cliente-1',
    nome: 'Cliente',
    email: 'cliente@email.com',
  },
  usuarios_contratacoes_prestador_idTousuarios: {
    id: 'prestador-1',
    nome: 'Prestador',
    email: 'prestador@email.com',
  },
};

function payloadAgendamento(overrides = {}) {
  return {
    prestador_id: 'prestador-1',
    servico_id: 10,
    data: '2026-05-10',
    hora_inicio: '10:00',
    hora_fim: '11:00',
    ...overrides,
  };
}

describe('Service_Agendamento.criarAgendamento', () => {
  it('cliente autenticado consegue solicitar agendamento', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue(prestadorUsuario as any);
    prismaMock.servicos.findFirst.mockResolvedValue(servico as any);
    prismaMock.contratacoes.findFirst.mockResolvedValue(null);
    prismaMock.contratacoes.create.mockResolvedValue(contratacaoCompleta as any);

    const resultado = await ServiceAgendamento.criarAgendamento(
      payloadAgendamento(),
      cliente,
    );

    expect(resultado.status).toBe(STATUS_CONTRATACAO.pendente);
    expect(prismaMock.contratacoes.create).toHaveBeenCalled();
  });

  it('prestador nao pode solicitar agendamento como cliente', async () => {
    await expect(
      ServiceAgendamento.criarAgendamento(payloadAgendamento(), {
        id: 'prestador-1',
        tipo: 'cuidador',
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('cliente nao pode solicitar agendamento para si mesmo', async () => {
    await expect(
      ServiceAgendamento.criarAgendamento(
        payloadAgendamento({ prestador_id: 'cliente-1' }),
        cliente,
      ),
    ).rejects.toThrow(/si mesmo/i);
  });

  it('deve falhar se prestador nao existir', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue(null);

    await expect(
      ServiceAgendamento.criarAgendamento(payloadAgendamento(), cliente),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('deve falhar se usuario informado nao for prestador', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue({
      ...prestadorUsuario,
      tipo: 'cliente',
    } as any);

    await expect(
      ServiceAgendamento.criarAgendamento(payloadAgendamento(), cliente),
    ).rejects.toThrow(/nao e um prestador/i);
  });

  it('deve falhar se servico nao pertencer ao prestador', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue(prestadorUsuario as any);
    prismaMock.servicos.findFirst.mockResolvedValue(null);

    await expect(
      ServiceAgendamento.criarAgendamento(payloadAgendamento(), cliente),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('deve falhar se data ou horario forem invalidos', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue(prestadorUsuario as any);
    prismaMock.servicos.findFirst.mockResolvedValue(servico as any);

    await expect(
      ServiceAgendamento.criarAgendamento(
        payloadAgendamento({ data: 'data-invalida' }),
        cliente,
      ),
    ).rejects.toThrow(/data/i);

    await expect(
      ServiceAgendamento.criarAgendamento(
        payloadAgendamento({ hora_inicio: '99:00' }),
        cliente,
      ),
    ).rejects.toThrow(/horario inicial/i);
  });

  it('deve impedir conflito de horario', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue(prestadorUsuario as any);
    prismaMock.servicos.findFirst.mockResolvedValue(servico as any);
    prismaMock.contratacoes.findFirst.mockResolvedValue({ id: 99 } as any);

    await expect(
      ServiceAgendamento.criarAgendamento(payloadAgendamento(), cliente),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('Service_Agendamento status', () => {
  it('prestador pode aceitar contratacao pendente', async () => {
    prismaMock.contratacoes.findUnique
      .mockResolvedValueOnce({
      id: 1,
      prestador_id: 'prestador-1',
      cliente_id: 'cliente-1',
      status: STATUS_CONTRATACAO.pendente,
      } as any)
      .mockResolvedValueOnce({
        ...contratacaoCompleta,
        status: STATUS_CONTRATACAO.confirmado,
      } as any);
    prismaMock.contratacoes.update.mockResolvedValue({} as any);

    const resultado = await ServiceAgendamento.aceitarContratacao(1, {
      id: 'prestador-1',
      tipo: 'cuidador',
    });

    expect(resultado.status).toBe(STATUS_CONTRATACAO.confirmado);
  });

  it('prestador pode cancelar contratacao pendente', async () => {
    prismaMock.contratacoes.findUnique
      .mockResolvedValueOnce({
      id: 1,
      prestador_id: 'prestador-1',
      cliente_id: 'cliente-1',
      status: STATUS_CONTRATACAO.pendente,
      } as any)
      .mockResolvedValueOnce({
        ...contratacaoCompleta,
        status: STATUS_CONTRATACAO.cancelado,
      } as any);
    prismaMock.contratacoes.update.mockResolvedValue({} as any);

    const resultado = await ServiceAgendamento.cancelarContratacao(1, {
      id: 'prestador-1',
      tipo: 'cuidador',
    });

    expect(resultado.status).toBe(STATUS_CONTRATACAO.cancelado);
  });

  it('contratacao confirmada pode ser finalizada', async () => {
    prismaMock.contratacoes.findUnique
      .mockResolvedValueOnce({
      id: 1,
      prestador_id: 'prestador-1',
      cliente_id: 'cliente-1',
      status: STATUS_CONTRATACAO.confirmado,
      } as any)
      .mockResolvedValueOnce({
        ...contratacaoCompleta,
        status: STATUS_CONTRATACAO.concluido,
      } as any);
    prismaMock.contratacoes.update.mockResolvedValue({} as any);

    const resultado = await ServiceAgendamento.finalizarContratacao(1, {
      id: 'cliente-1',
      tipo: 'cliente',
    });

    expect(resultado.status).toBe(STATUS_CONTRATACAO.concluido);
  });

  it('contratacao fora do status correto nao pode ser finalizada', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      id: 1,
      prestador_id: 'prestador-1',
      cliente_id: 'cliente-1',
      status: STATUS_CONTRATACAO.pendente,
    } as any);

    await expect(
      ServiceAgendamento.finalizarContratacao(1, {
        id: 'cliente-1',
        tipo: 'cliente',
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
