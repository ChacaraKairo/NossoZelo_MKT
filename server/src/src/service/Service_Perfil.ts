/**
 * @author Kairo Chácara & ZeloArchitect AI
 * @version 1.3
 * @date 22/04/2026
 * @description Service especializado na gestão de perfis.
 * CORREÇÃO: Nomes das relações ajustados conforme o schema.prisma gerado.
 */

import {
  contratacoes_status,
} from '@prisma/client';
import { compare, hash } from 'bcrypt';
import prisma from '../lib/prisma';
import { STATUS_PRIVACY_GATE_CLIENTE } from '../constants/dominio';

async function anexarAvaliacoesEmContratacoes(contratacoes: any[]) {
  if (!contratacoes.length) return contratacoes;

  const avaliacoes = await prisma.avaliacoes.findMany({
    where: {
      contratacao_id: {
        in: contratacoes.map((contratacao) => contratacao.id),
      },
    },
    select: {
      id: true,
      contratacao_id: true,
      cliente_id: true,
      prestador_id: true,
      tipo_prestador: true,
      nota: true,
      comentario: true,
      data_avaliacao: true,
    },
  });

  const avaliacoesPorContratacao = new Map(
    avaliacoes.map((avaliacao) => [
      avaliacao.contratacao_id,
      avaliacao,
    ]),
  );

  return contratacoes.map((contratacao) => ({
    ...contratacao,
    avaliacao:
      avaliacoesPorContratacao.get(contratacao.id) ?? null,
  }));
}

export class ServicePerfil {
  static async alterarSenhaSegura(
    usuarioId: string,
    senhaAtual: string,
    novaSenha: string,
  ) {
    if (!senhaAtual || !novaSenha) {
      throw new Error('Senha atual e nova senha são obrigatórias.');
    }

    if (
      novaSenha.length < 8 ||
      novaSenha.length > 72 ||
      !/[a-z]/.test(novaSenha) ||
      !/[A-Z]/.test(novaSenha) ||
      !/\d/.test(novaSenha) ||
      !/[^A-Za-z0-9]/.test(novaSenha)
    ) {
      throw new Error(
        'A nova senha deve ter 8 a 72 caracteres, com letra maiúscula, minúscula, número e caractere especial.',
      );
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { id: true, senha: true },
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado.');
    }

    const senhaConfere = await compare(senhaAtual, usuario.senha);
    if (!senhaConfere) {
      const error = new Error('Senha atual incorreta.') as Error & {
        status?: number;
      };
      error.status = 403;
      throw error;
    }

    const senhaCriptografada = await hash(novaSenha, 10);
    await prisma.usuarios.update({
      where: { id: usuarioId },
      data: { senha: senhaCriptografada },
    });

    return { message: 'Senha atualizada com sucesso.' };
  }

  /**
   * Recupera o perfil completo do usuário logado com as relações mapeadas pelo Prisma.
   */
  static async obterMeuPerfilCompleto(usuarioId: string) {
    console.log(
      `[LOG-FLUXO] Iniciando busca agregada para o UsuarioID: ${usuarioId}`,
    );

    try {
      const perfilEnriquecido =
        await prisma.usuarios.findUnique({
          where: { id: usuarioId },
          include: {
            cuidadores: true,
            enfermeiros: true,
            acompanhantes: true,
            servicos: true,
            agenda: {
              orderBy: { data: 'asc' },
              take: 20,
            },
            avaliacoes_avaliacoes_cliente_idTousuarios: {
              include: {
                usuarios_avaliacoes_prestador_idTousuarios:
                  {
                    select: {
                      nome: true,
                      url_foto_perfil: true,
                    },
                  },
              },
              orderBy: {
                data_avaliacao: 'desc',
              },
            },
            // 🔥 CORREÇÃO: Nome exato gerado pelo Prisma no schema
            avaliacoes_avaliacoes_prestador_idTousuarios: {
              include: {
                usuarios_avaliacoes_cliente_idTousuarios: {
                  select: {
                    nome: true,
                    url_foto_perfil: true,
                  },
                },
              },
              orderBy: {
                data_avaliacao: 'desc', // No seu schema é data_avaliacao, não criado_em
              },
            },
            // 🔥 CORREÇÃO: Nomes das relações de contratações
            contratacoes_contratacoes_prestador_idTousuarios:
              {
                take: 5,
                orderBy: { data: 'desc' },
                include: {
                  usuarios_contratacoes_cliente_idTousuarios:
                    { select: { nome: true } },
                },
              },
            contratacoes_contratacoes_cliente_idTousuarios:
              {
                take: 5,
                orderBy: { data: 'desc' },
                include: {
                  usuarios_contratacoes_prestador_idTousuarios:
                    { select: { nome: true } },
                },
              },
          },
        });

      if (!perfilEnriquecido) {
        throw new Error(
          'Usuário não encontrado no banco de dados.',
        );
      }

      const {
        senha,
        cuidadores,
        enfermeiros,
        acompanhantes,
        servicos,
        agenda,
        avaliacoes_avaliacoes_cliente_idTousuarios,
        avaliacoes_avaliacoes_prestador_idTousuarios,
        contratacoes_contratacoes_cliente_idTousuarios,
        contratacoes_contratacoes_prestador_idTousuarios,
        ...dadosUsuario
      } = perfilEnriquecido;

      const perfilTipo = perfilEnriquecido.tipo;
      const ehPrestador = [
        'cuidador',
        'enfermeiro',
        'acompanhante',
      ].includes(perfilTipo);
      const contratacoesClienteComAvaliacoes =
        await anexarAvaliacoesEmContratacoes(
          contratacoes_contratacoes_cliente_idTousuarios,
        );
      const contratacoesPrestadorComAvaliacoes =
        await anexarAvaliacoesEmContratacoes(
          contratacoes_contratacoes_prestador_idTousuarios,
        );

      if (!ehPrestador) {
        return {
          perfil_tipo: perfilTipo,
          dados_usuario: dadosUsuario,
          contratacoes:
            contratacoesClienteComAvaliacoes,
          avaliacoes_feitas:
            avaliacoes_avaliacoes_cliente_idTousuarios,
        };
      }

      const dadosProfissionais =
        perfilTipo === 'cuidador'
          ? cuidadores
          : perfilTipo === 'enfermeiro'
            ? enfermeiros
            : acompanhantes;

      // Log de sucesso usando os arrays inclusos
      console.log(
        `[LOG-FLUXO] Sucesso: Dados recuperados (Serviços: ${perfilEnriquecido.servicos.length})`,
      );

      return {
        perfil_tipo: perfilTipo,
        dados_usuario: dadosUsuario,
        dados_profissionais: dadosProfissionais,
        servicos,
        agenda,
        avaliacoes_recebidas:
          avaliacoes_avaliacoes_prestador_idTousuarios,
        contratacoes:
          contratacoesPrestadorComAvaliacoes,
        avaliacao_media: perfilEnriquecido.avaliacao_media,
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao obter dados do usuário ${usuarioId}: ${error.message}`,
      );
      throw error;
    }
  }

  static async obterResumoPerfil(usuarioId: string) {
    console.log(
      `[LOG-FLUXO] Buscando resumo do perfil para o UsuarioID: ${usuarioId}`,
    );

    try {
      const usuario = await prisma.usuarios.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          nome: true,
          tipo: true,
          url_foto_perfil: true,
          cidade: true,
          estado: true,
          bairro: true,
          telefone: true,
          avaliacao_media: true,
        },
      });

      if (!usuario) {
        throw new Error('Usuário não encontrado.');
      }

      const tiposPrestador = [
        'cuidador',
        'enfermeiro',
        'acompanhante',
      ];
      const ehPrestador = tiposPrestador.includes(
        usuario.tipo,
      );

      const [totalContratacoes, totalAvaliacoes] =
        await Promise.all([
          prisma.contratacoes.count({
            where: ehPrestador
              ? { prestador_id: usuarioId }
              : { cliente_id: usuarioId },
          }),
          prisma.avaliacoes.count({
            where: ehPrestador
              ? { prestador_id: usuarioId }
              : { cliente_id: usuarioId },
          }),
        ]);

      let perfilProfissionalExiste = true;

      if (usuario.tipo === 'cuidador') {
        perfilProfissionalExiste = Boolean(
          await prisma.cuidadores.findUnique({
            where: { usuario_id: usuarioId },
            select: { usuario_id: true },
          }),
        );
      } else if (usuario.tipo === 'enfermeiro') {
        perfilProfissionalExiste = Boolean(
          await prisma.enfermeiros.findUnique({
            where: { usuario_id: usuarioId },
            select: { usuario_id: true },
          }),
        );
      } else if (usuario.tipo === 'acompanhante') {
        perfilProfissionalExiste = Boolean(
          await prisma.acompanhantes.findUnique({
            where: { usuario_id: usuarioId },
            select: { usuario_id: true },
          }),
        );
      }

      const dadosBasicosCompletos = Boolean(
        usuario.nome &&
          usuario.telefone &&
          usuario.cidade &&
          usuario.estado,
      );

      return {
        id: usuario.id,
        nome: usuario.nome,
        tipo: usuario.tipo,
        url_foto_perfil: usuario.url_foto_perfil,
        cidade: usuario.cidade,
        estado: usuario.estado,
        avaliacao_media: usuario.avaliacao_media,
        total_avaliacoes: totalAvaliacoes,
        total_contratacoes: totalContratacoes,
        perfil_completo:
          dadosBasicosCompletos && perfilProfissionalExiste,
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao obter resumo do perfil ${usuarioId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Vitrine pública ajustada com os nomes de relação do schema.
   */
  static async obterVitrinePrestador(prestadorId: string) {
    try {
      const perfil = await prisma.usuarios.findUnique({
        where: { id: prestadorId },
        include: {
          cuidadores: true,
          enfermeiros: true,
          acompanhantes: true,
          servicos: true,
          avaliacoes_avaliacoes_prestador_idTousuarios: {
            take: 3,
            orderBy: { nota: 'desc' },
            include: {
              usuarios_avaliacoes_cliente_idTousuarios: {
                select: {
                  nome: true,
                  url_foto_perfil: true,
                },
              },
            },
          },
        },
      });

      if (!perfil)
        throw new Error('Prestador não encontrado');

      const {
        senha,
        cpf,
        email,
        telefone,
        endereco,
        cuidadores,
        enfermeiros,
        acompanhantes,
        ...dadosPublicos
      } = perfil;
      const dadosProfissionais =
        perfil.tipo === 'cuidador'
          ? cuidadores
          : perfil.tipo === 'enfermeiro'
            ? enfermeiros
            : perfil.tipo === 'acompanhante'
              ? acompanhantes
              : null;

      return {
        ...dadosPublicos,
        dados_profissionais: dadosProfissionais,
        bio: dadosProfissionais?.bio ?? null,
        anos_experiencia:
          dadosProfissionais?.anos_experiencia ?? null,
        coren:
          perfil.tipo === 'enfermeiro'
            ? enfermeiros?.coren
            : undefined,
        valor_hora: dadosProfissionais?.valor_hora ?? null,
        valor_diaria: dadosProfissionais?.valor_diaria ?? null,
        disponibilidade:
          dadosProfissionais?.disponibilidade ?? null,
        especialidades:
          dadosProfissionais?.especialidades ?? null,
        contatos: {
          email,
          telefone,
          cidade: perfil.cidade,
          estado: perfil.estado,
        },
        rating: Number(perfil.avaliacao_media) || 0,
        pode_ver_contato: Boolean(email || telefone),
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha na vitrine: ${error.message}`,
      );
      throw error;
    }
  }

  static async atualizarDadosPerfil(
    usuarioId: string,
    dadosParciais: any,
  ) {
    console.log(
      `[LOG-FLUXO] Atualizando dados do usuário ID: ${usuarioId}`,
    );
    try {
      const perfilAtualizado = await prisma.usuarios.update(
        {
          where: { id: usuarioId },
          data: dadosParciais,
        },
      );

      const { senha, ...dadosSeguros } = perfilAtualizado;
      return dadosSeguros;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao atualizar perfil: ${error.message}`,
      );
      throw error;
    }
  }

  static async obterDadosClienteParaPrestador(
    clienteId: string,
    prestadorId: string,
  ) {
    console.log(
      `[LOG-FLUXO] Privacy Gate: validando acesso do prestador ${prestadorId} aos dados do cliente ${clienteId}.`,
    );

    const statusPermitidos: contratacoes_status[] = [
      ...STATUS_PRIVACY_GATE_CLIENTE,
    ];

    try {
      const contratacaoValida =
        await prisma.contratacoes.findFirst({
          where: {
            cliente_id: clienteId,
            prestador_id: prestadorId,
            status: {
              in: statusPermitidos,
            },
          },
          orderBy: {
            data: 'desc',
          },
          select: {
            id: true,
            status: true,
          },
        });

      if (!contratacaoValida) {
        console.warn(
          `[LOG-FLUXO] Privacy Gate: nenhuma contrataÃ§Ã£o vÃ¡lida encontrada entre cliente ${clienteId} e prestador ${prestadorId}.`,
        );
        return null;
      }

      const cliente = await prisma.usuarios.findUnique({
        where: { id: clienteId },
        select: {
          id: true,
          nome: true,
          url_foto_perfil: true,
          cidade: true,
          estado: true,
          bairro: true,
          telefone: true,
          email: true,
          endereco: true,
        },
      });

      if (!cliente) {
        console.warn(
          `[LOG-FLUXO] Privacy Gate: cliente ${clienteId} nÃ£o encontrado apÃ³s validaÃ§Ã£o de contrataÃ§Ã£o.`,
        );
        return null;
      }

      return {
        id: cliente.id,
        nome: cliente.nome,
        url_foto_perfil: cliente.url_foto_perfil,
        cidade: cliente.cidade,
        estado: cliente.estado,
        bairro: cliente.bairro,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
        contato_liberado: true,
        contratacao_id: contratacaoValida.id,
        status_contratacao: contratacaoValida.status,
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Privacy Gate: falha ao validar acesso aos dados do cliente: ${error.message}`,
      );
      throw error;
    }
  }

  static async atualizarMediaAvaliacao(usuarioId: string) {
    console.log(
      `[LOG-FLUXO] Recalculando média para o ID: ${usuarioId}`,
    );

    try {
      // Busca todas as notas recebidas por este prestador
      const avaliacoes = await prisma.avaliacoes.findMany({
        where: { prestador_id: usuarioId },
      });

      if (avaliacoes.length === 0) return 0;

      const soma = avaliacoes.reduce(
        (acc, curr) => acc + (curr.nota ?? 0),
        0,
      );
      const media = soma / avaliacoes.length;

      // Atualiza o campo na tabela de usuários
      await prisma.usuarios.update({
        where: { id: usuarioId },
        data: { avaliacao_media: media },
      });

      return media;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao atualizar média: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * ATUALIZAÇÃO INTELIGENTE MULTI-TABELA (DDD)
   * Recebe um payload achatado do frontend e distribui para as tabelas relacionais corretas.
   * Utiliza $transaction para garantir a integridade dos dados.
   */
  static async atualizarDados(
    usuarioId: string,
    tipo: string,
    dados: any,
  ) {
    console.log(
      `[LOG-FLUXO] ServicePerfil: Iniciando atualização multi-tabela para o ID ${usuarioId}`,
    );

    // 1. Dicionário de campos pertencentes à tabela mãe (usuarios)
    const camposBloqueados = new Set([
      'id',
      'email',
      'senha',
      'cpf',
      'tipo',
      'role',
      'admin',
      'avaliacao_media',
      'criado_em',
      'updated_at',
    ]);

    const camposPermitidosUsuarios = new Set([
      'nome',
      'telefone',
      'cidade',
      'estado',
      'bairro',
      'endereco',
      'url_foto_perfil',
    ]);

    const camposUsuariosNoSchema = new Set([
      'nome',
      'telefone',
      'cidade',
      'estado',
      'bairro',
      'endereco',
      'url_foto_perfil',
    ]);

    const camposPermitidosPorTipo: Record<
      string,
      Set<string>
    > = {
      cuidador: new Set([
        'bio',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
      enfermeiro: new Set([
        'bio',
        'coren',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
      acompanhante: new Set([
        'bio',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
    };

    const camposProfissionaisNoSchemaPorTipo: Record<
      string,
      Set<string>
    > = {
      cuidador: new Set([
        'bio',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
      enfermeiro: new Set([
        'bio',
        'coren',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
      acompanhante: new Set([
        'bio',
        'anos_experiencia',
        'valor_hora',
        'valor_diaria',
        'disponibilidade',
        'especialidades',
      ]),
    };

    const dadosUsuario: any = {};
    const dadosEspecificos: any = {};
    const camposPermitidosProfissional =
      camposPermitidosPorTipo[tipo] ?? new Set<string>();
    const camposProfissionaisNoSchema =
      camposProfissionaisNoSchemaPorTipo[tipo] ??
      new Set<string>();

    // 2. Triagem dos dados recebidos
    for (const [chave, valor] of Object.entries(dados ?? {})) {
      if (camposBloqueados.has(chave)) {
        continue;
      }

      if (
        camposPermitidosUsuarios.has(chave) &&
        camposUsuariosNoSchema.has(chave)
      ) {
        dadosUsuario[chave] = valor;
        continue;
      }

      if (
        camposPermitidosProfissional.has(chave) &&
        camposProfissionaisNoSchema.has(chave)
      ) {
        // Se não for da tabela mãe, é um campo profissional (ex: bio, coren, anos_experiencia)
        dadosEspecificos[chave] = valor;
      }
    }

    const operacoesBanco: any[] = [];

    // 3. Monta a query da tabela mãe (se houver o que atualizar)
    if (Object.keys(dadosUsuario).length > 0) {
      operacoesBanco.push(
        prisma.usuarios.update({
          where: { id: usuarioId },
          data: dadosUsuario,
        }),
      );
    }

    // 4. Monta a query da tabela específica do profissional
    if (
      Object.keys(dadosEspecificos).length > 0 &&
      tipo !== 'cliente'
    ) {
      if (tipo === 'cuidador') {
        operacoesBanco.push(
          prisma.cuidadores.upsert({
            where: { usuario_id: usuarioId },
            update: dadosEspecificos,
            create: {
              usuario_id: usuarioId,
              ...dadosEspecificos,
            },
          }),
        );
      } else if (tipo === 'enfermeiro') {
        const enfermeiroExistente =
          await prisma.enfermeiros.findUnique({
            where: { usuario_id: usuarioId },
            select: { usuario_id: true },
          });

        if (enfermeiroExistente || dadosEspecificos.coren) {
          operacoesBanco.push(
            prisma.enfermeiros.upsert({
              where: { usuario_id: usuarioId },
              update: dadosEspecificos,
              create: {
                usuario_id: usuarioId,
                ...dadosEspecificos,
              },
            }),
          );
        }
      } else if (tipo === 'acompanhante') {
        operacoesBanco.push(
          prisma.acompanhantes.upsert({
            where: { usuario_id: usuarioId },
            update: dadosEspecificos,
            create: {
              usuario_id: usuarioId,
              ...dadosEspecificos,
            },
          }),
        );
      }
    }

    try {
      // 5. Executa tudo de uma vez. Se uma falhar, o Prisma reverte a outra (Rollback automático)
      await prisma.$transaction(operacoesBanco);

      // 6. Retorna o perfil fresquinho, já usando o seu método de obter completo
      return await this.obterMeuPerfilCompleto(usuarioId);
    } catch (error: any) {
      console.error(
        '[ERRO-FLUXO] Falha na transação de atualização de perfil:',
        error.message,
      );
      throw new Error(
        'Falha ao sincronizar dados com o banco. Verifique os formatos enviados.',
      );
    }
  }
}

export default ServicePerfil;
