import { describe, expect, it } from 'vitest';
import ServicePerfil from '../../src/service/Service_Perfil';
import { STATUS_CONTRATACAO } from '../../src/constants/dominio';
import { prismaMock } from '../helpers/prismaMock';

describe('Service_Perfil Privacy Gate', () => {
  it('prestador sem contratacao valida nao pode ver dados do cliente', async () => {
    prismaMock.contratacoes.findFirst.mockResolvedValue(null);

    const resultado =
      await ServicePerfil.obterDadosClienteParaPrestador(
        'cliente-1',
        'prestador-1',
      );

    expect(resultado).toBeNull();
    expect(prismaMock.usuarios.findUnique).not.toHaveBeenCalled();
  });

  it('prestador com contratacao confirmada pode ver dados liberados', async () => {
    prismaMock.contratacoes.findFirst.mockResolvedValue({
      id: 5,
      status: STATUS_CONTRATACAO.confirmado,
    } as any);
    prismaMock.usuarios.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nome: 'Cliente',
      url_foto_perfil: null,
      cidade: 'Indaiatuba',
      estado: 'SP',
      bairro: 'Centro',
      telefone: '11999999999',
      email: 'cliente@email.com',
      endereco: 'Rua Teste',
    } as any);

    const resultado =
      await ServicePerfil.obterDadosClienteParaPrestador(
        'cliente-1',
        'prestador-1',
      );

    expect(resultado).toMatchObject({
      contato_liberado: true,
      contratacao_id: 5,
      status_contratacao: STATUS_CONTRATACAO.confirmado,
    });
    expect(resultado).not.toHaveProperty('senha');
    expect(resultado).not.toHaveProperty('cpf');
  });

  it('prestador com contratacao concluida pode ver dados liberados', async () => {
    prismaMock.contratacoes.findFirst.mockResolvedValue({
      id: 6,
      status: STATUS_CONTRATACAO.concluido,
    } as any);
    prismaMock.usuarios.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nome: 'Cliente',
      telefone: '11999999999',
      email: 'cliente@email.com',
    } as any);

    const resultado =
      await ServicePerfil.obterDadosClienteParaPrestador(
        'cliente-1',
        'prestador-1',
      );

    expect(resultado?.contato_liberado).toBe(true);
    expect(resultado?.status_contratacao).toBe(
      STATUS_CONTRATACAO.concluido,
    );
  });

  it('retorna null se cliente nao existir apos contratacao valida', async () => {
    prismaMock.contratacoes.findFirst.mockResolvedValue({
      id: 6,
      status: STATUS_CONTRATACAO.concluido,
    } as any);
    prismaMock.usuarios.findUnique.mockResolvedValue(null);

    await expect(
      ServicePerfil.obterDadosClienteParaPrestador(
        'cliente-inexistente',
        'prestador-1',
      ),
    ).resolves.toBeNull();
  });
});

describe('Service_Perfil obterMeuPerfilCompleto', () => {
  it('nao retorna senha em perfil de cliente', async () => {
    prismaMock.usuarios.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nome: 'Cliente',
      tipo: 'cliente',
      senha: 'hash',
      cuidadores: null,
      enfermeiros: null,
      acompanhantes: null,
      servicos: [],
      agenda: [],
      avaliacoes_avaliacoes_cliente_idTousuarios: [],
      avaliacoes_avaliacoes_prestador_idTousuarios: [],
      contratacoes_contratacoes_cliente_idTousuarios: [],
      contratacoes_contratacoes_prestador_idTousuarios: [],
    } as any);

    const resultado =
      await ServicePerfil.obterMeuPerfilCompleto('cliente-1');

    expect(resultado.perfil_tipo).toBe('cliente');
    expect(resultado.dados_usuario).not.toHaveProperty('senha');
  });
});
