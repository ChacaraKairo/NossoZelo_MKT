import { describe, expect, it, vi } from 'vitest';
import ServiceAvaliacao from '../../src/service/Service_Avaliacao';
import ServicePerfil from '../../src/service/Service_Perfil';
import { STATUS_CONTRATACAO } from '../../src/constants/dominio';
import { prismaMock } from '../helpers/prismaMock';

const payload = {
  contratacao_id: 1,
  cliente_id: 'cliente-1',
  prestador_id: 'prestador-1',
  nota: 5,
  comentario: 'Excelente',
};

describe('Service_Avaliacao.registrarAvaliacao', () => {
  it('cliente pode avaliar contratacao concluida', async () => {
    vi.spyOn(ServicePerfil, 'atualizarMediaAvaliacao').mockResolvedValue(5);
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      id: 1,
      cliente_id: 'cliente-1',
      prestador_id: 'prestador-1',
      tipo_prestador: 'cuidador',
      status: STATUS_CONTRATACAO.concluido,
    } as any);
    prismaMock.avaliacoes.findUnique.mockResolvedValue(null);
    prismaMock.avaliacoes.create.mockResolvedValue({
      id: 10,
      ...payload,
    } as any);

    const resultado =
      await ServiceAvaliacao.registrarAvaliacao(payload);

    expect(resultado.id).toBe(10);
    expect(ServicePerfil.atualizarMediaAvaliacao).toHaveBeenCalledWith(
      'prestador-1',
    );
  });

  it('contratacao pendente nao pode ser avaliada', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      ...payload,
      status: STATUS_CONTRATACAO.pendente,
    } as any);

    await expect(
      ServiceAvaliacao.registrarAvaliacao(payload),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('contratacao confirmada ainda nao pode ser avaliada', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      ...payload,
      status: STATUS_CONTRATACAO.confirmado,
    } as any);

    await expect(
      ServiceAvaliacao.registrarAvaliacao(payload),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('nao pode avaliar contratacao de outro cliente', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      ...payload,
      cliente_id: 'outro-cliente',
      status: STATUS_CONTRATACAO.concluido,
    } as any);

    await expect(
      ServiceAvaliacao.registrarAvaliacao(payload),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('nao pode avaliar prestador diferente da contratacao', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      ...payload,
      prestador_id: 'outro-prestador',
      status: STATUS_CONTRATACAO.concluido,
    } as any);

    await expect(
      ServiceAvaliacao.registrarAvaliacao(payload),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('nota menor que 1 deve falhar', async () => {
    await expect(
      ServiceAvaliacao.registrarAvaliacao({ ...payload, nota: 0 }),
    ).rejects.toThrow(/entre 1 e 5/i);
  });

  it('nota maior que 5 deve falhar', async () => {
    await expect(
      ServiceAvaliacao.registrarAvaliacao({ ...payload, nota: 6 }),
    ).rejects.toThrow(/entre 1 e 5/i);
  });

  it('avaliacao duplicada deve falhar', async () => {
    prismaMock.contratacoes.findUnique.mockResolvedValue({
      ...payload,
      status: STATUS_CONTRATACAO.concluido,
    } as any);
    prismaMock.avaliacoes.findUnique.mockResolvedValue({ id: 1 } as any);

    await expect(
      ServiceAvaliacao.registrarAvaliacao(payload),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('Service_Perfil.atualizarMediaAvaliacao', () => {
  it('media do prestador deve ser recalculada apos avaliacao', async () => {
    prismaMock.avaliacoes.findMany.mockResolvedValue([
      { nota: 4 },
      { nota: 5 },
    ] as any);
    prismaMock.usuarios.update.mockResolvedValue({} as any);

    const media =
      await ServicePerfil.atualizarMediaAvaliacao('prestador-1');

    expect(media).toBe(4.5);
    expect(prismaMock.usuarios.update).toHaveBeenCalledWith({
      where: { id: 'prestador-1' },
      data: { avaliacao_media: 4.5 },
    });
  });
});
