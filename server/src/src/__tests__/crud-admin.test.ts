import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
  planosUpdate: vi.fn(),
  servicosDelete: vi.fn(),
}));

vi.mock('../lib/prisma', () => ({
  default: {
    $queryRaw: mocks.queryRaw,
    planos: {
      update: mocks.planosUpdate,
    },
    servicos: {
      delete: mocks.servicosDelete,
    },
  },
}));

import ServiceCrud from '../service/Service_Crud';

describe('CRUD administrativo generico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia entidade sensivel no service', async () => {
    await expect(ServiceCrud.findAll('usuarios')).rejects.toThrow(
      'Entidade bloqueada para CRUD generico.',
    );
  });

  it('retorna erro para entidade permitida que nao existe no banco', async () => {
    mocks.queryRaw.mockResolvedValue([{ TABLE_NAME: 'planos' }]);

    await expect(ServiceCrud.findAll('servicos')).rejects.toThrow(
      'Entidade servicos não existe no banco de dados.',
    );
  });

  it('bloqueia campo invalido em busca dinamica', async () => {
    mocks.queryRaw.mockResolvedValue([{ TABLE_NAME: 'planos' }]);

    await expect(
      ServiceCrud.findByField('planos', 'nome;DROP TABLE usuarios', 'mensal'),
    ).rejects.toThrow('Campo invalido para CRUD generico.');
  });

  it('usa soft delete para entidade administrativa com campo de desativacao', async () => {
    mocks.queryRaw.mockResolvedValue([{ TABLE_NAME: 'planos' }]);
    mocks.planosUpdate.mockResolvedValue({ id: 1, ativo: false });

    const result = await ServiceCrud.delete('planos', '1');

    expect(result).toEqual({ id: 1, ativo: false });
    expect(mocks.planosUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { ativo: false },
    });
    expect(mocks.servicosDelete).not.toHaveBeenCalled();
  });

  it('bloqueia delete fisico quando entidade nao tem soft delete configurado', async () => {
    mocks.queryRaw.mockResolvedValue([{ TABLE_NAME: 'servicos' }]);

    await expect(ServiceCrud.delete('servicos', '1')).rejects.toThrow(
      'Delete fisico desabilitado para servicos.',
    );
    expect(mocks.servicosDelete).not.toHaveBeenCalled();
  });
});
