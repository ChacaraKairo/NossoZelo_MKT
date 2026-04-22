/**
 * @author Kairo Chácara & ZeloArchitect AI
 * @version 1.3
 * @date 22/04/2026
 * @description Service especializado na gestão de perfis.
 * CORREÇÃO: Nomes das relações ajustados conforme o schema.prisma gerado.
 */

import {
  PrismaClient,
  contratacoes_status,
} from '@prisma/client';

console.log(
  '[LOG-FLUXO] Inicializando instância do PrismaClient para o ServicePerfil.',
);
const prisma = new PrismaClient();

export class ServicePerfil {
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
            servicos: true,
            agenda: {
              orderBy: { data: 'asc' },
              take: 20,
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

      const { senha, ...dadosSeguros } = perfilEnriquecido;

      // Log de sucesso usando os arrays inclusos
      console.log(
        `[LOG-FLUXO] Sucesso: Dados recuperados (Serviços: ${perfilEnriquecido.servicos.length})`,
      );

      return dadosSeguros;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao obter dados do usuário ${usuarioId}: ${error.message}`,
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
          servicos: true,
          avaliacoes_avaliacoes_prestador_idTousuarios: {
            take: 3,
            orderBy: { nota: 'desc' },
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
        ...dadosPublicos
      } = perfil;

      return {
        ...dadosPublicos,
        rating: Number(perfil.avaliacao_media) || 0,
        pode_ver_contato: false,
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
    // Implementação futura da lógica de Privacy Gate
    return null;
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
}

export default ServicePerfil;
