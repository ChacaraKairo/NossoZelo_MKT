import { describe, expect, it } from 'vitest';
import ServiceServico from '../../src/service/Service_Servico';
import { prismaMock } from '../helpers/prismaMock';

const prestador = { id: 'prestador-1', tipo: 'cuidador' };
const cliente = { id: 'cliente-1', tipo: 'cliente' };
const payloadServico = {
  nome: 'Atendimento domiciliar',
  descricao: 'Servico profissional de acompanhamento domiciliar.',
  valor: 120,
  tipo_cobranca: 'hora',
};

describe('Service_Servico', () => {
  it('prestador pode criar servico', async () => {
    prismaMock.servicos.create.mockResolvedValue({
      id: 1,
      ...payloadServico,
    } as any);

    const resultado = await ServiceServico.criar(
      payloadServico,
      prestador,
    );

    expect(resultado.id).toBe(1);
    expect(prismaMock.servicos.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          prestador_id: 'prestador-1',
          tipo_prestador: 'cuidador',
        }),
      }),
    );
  });

  it('cliente nao pode criar servico', async () => {
    await expect(
      ServiceServico.criar(payloadServico, cliente),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('prestador so pode editar seus proprios servicos', async () => {
    prismaMock.servicos.findFirst.mockResolvedValue(null);

    await expect(
      ServiceServico.atualizar(1, { nome: 'Novo nome' }, prestador),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('prestador pode editar seus proprios servicos', async () => {
    prismaMock.servicos.findFirst.mockResolvedValue({ id: 1 } as any);
    prismaMock.servicos.update.mockResolvedValue({
      id: 1,
      nome: 'Novo nome',
    } as any);

    const resultado = await ServiceServico.atualizar(
      1,
      { nome: 'Novo nome' },
      prestador,
    );

    expect(resultado.nome).toBe('Novo nome');
  });

  it('prestador so pode remover seus proprios servicos', async () => {
    prismaMock.servicos.findFirst.mockResolvedValue(null);

    await expect(
      ServiceServico.remover(1, prestador),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('prestador pode remover seus proprios servicos', async () => {
    prismaMock.servicos.findFirst.mockResolvedValue({ id: 1 } as any);
    prismaMock.servicos.delete.mockResolvedValue({ id: 1 } as any);

    await expect(
      ServiceServico.remover(1, prestador),
    ).resolves.toEqual({ id: 1, removido: true });
  });
});
