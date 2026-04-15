/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela gestão de perfis de usuários,
 * controlando a visibilidade de dados (vitrine pública vs. dados privados) e
 * métricas de reputação (avaliações).
 * @rota server\src\src\service\Service_Perfil.ts
 */

import {
  PrismaClient,
  contratacoes_status,
} from '@prisma/client';
import ServiceUser from './Service_User';

console.log(
  '[LOG-FLUXO] Inicializando instância do PrismaClient para o ServicePerfil.',
);
const prisma = new PrismaClient();

export class ServicePerfil {
  /**
   * Recupera o perfil completo do usuário logado, incluindo dados sensíveis e relacionamentos.
   * @param {string} usuarioId - UUID/ID do usuário logado.
   * @returns {Promise<any>} - Objeto contendo o perfil completo retornado pelo ServiceUser.
   * @throws {Error} - Lança erro em caso de falha na integração com ServiceUser.
   */
  static async obterMeuPerfilCompleto(usuarioId: string) {
    console.log(
      `[LOG-FLUXO] Iniciando obterMeuPerfilCompleto para o UsuarioID: ${usuarioId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Solicitando busca de perfil enriquecido ao ServiceUser para o ID: ${usuarioId}`,
      );

      // Chamada assíncrona para o serviço de usuário
      const perfil =
        await ServiceUser.buscarUsuarioCompleto(usuarioId);

      console.log(
        `[LOG-FLUXO] Sucesso: Perfil completo recuperado para o ID: ${usuarioId}.`,
      );
      return perfil;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao obter perfil completo do usuário ${usuarioId}. Motivo: ${
          error.message || error
        }`,
      );
      throw error;
    }
  }

  /**
   * Retorna os dados públicos de um prestador para exibição na vitrine, ocultando informações sensíveis.
   * @param {string} prestadorId - UUID/ID do prestador de serviços.
   * @returns {Promise<any>} - Objeto com dados filtrados para exibição pública.
   * @throws {Error} - Erro no processamento dos dados ou busca no banco.
   */
  static async obterVitrinePrestador(prestadorId: string) {
    console.log(
      `[LOG-FLUXO] Iniciando obterVitrinePrestador para o PrestadorID: ${prestadorId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Consultando dados base do prestador ${prestadorId} via ServiceUser.`,
      );
      const perfil =
        await ServiceUser.buscarUsuarioCompleto(
          prestadorId,
        );

      console.log(
        `[LOG-FLUXO] Aplicando filtro de privacidade (LGPD) para a vitrine pública do ID: ${prestadorId}`,
      );

      // Desestruturação para remoção de campos sensíveis mantendo nomes originais
      const {
        senha,
        cpf,
        email,
        telefone,
        documentos,
        ...dadosPublicos
      } = perfil;

      const resultado = {
        ...dadosPublicos,
        rating: Number(perfil.avaliacao_media) || 0,
        pode_ver_contato: false,
      };

      console.log(
        `[LOG-FLUXO] Vitrine gerada com êxito para o prestador ${prestadorId}. Rating médio: ${resultado.rating}`,
      );
      return resultado;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao gerar vitrine pública para o prestador ${prestadorId}: ${
          error.message || error
        }`,
      );
      throw error;
    }
  }

  /**
   * Retorna os dados do cliente para o prestador, liberando contato apenas se houver serviço confirmado/pago.
   * @param {string} clienteId - ID do cliente (dono dos dados).
   * @param {string} prestadorId - ID do prestador solicitante.
   * @returns {Promise<any>} - Dados do cliente com ou sem telefone, dependendo do vínculo.
   * @throws {Error} - Caso o cliente não exista ou falha na consulta de contratos.
   */
  static async obterDadosClienteParaPrestador(
    clienteId: string,
    prestadorId: string,
  ) {
    console.log(
      `[LOG-FLUXO] Iniciando obterDadosClienteParaPrestador. Contexto: Cliente ${clienteId} -> Prestador ${prestadorId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Executando query findUnique na tabela 'usuarios' para o cliente: ${clienteId}`,
      );
      const cliente = await prisma.usuarios.findUnique({
        where: { id: clienteId },
        select: {
          nome: true,
          url_foto_perfil: true,
          avaliacao_media: true,
          telefone: true,
          tipo: true,
        },
      });

      // Ramificação condicional: Existência do cliente
      if (!cliente) {
        console.error(
          `[ERRO-FLUXO] Operação abortada: Registro do cliente ${clienteId} é inexistente.`,
        );
        throw new Error('Cliente não encontrado');
      }

      console.log(
        `[LOG-FLUXO] Cliente localizado. Verificando regras de negócio para liberação de contato.`,
      );

      // Definição de status que permitem a visualização de contato
      const statusLiberados = [
        'confirmado',
        'manual',
        'paga',
      ] as any as contratacoes_status[];

      console.log(
        `[LOG-FLUXO] Consultando vínculo contratual ativo com status: ${statusLiberados.join(
          ', ',
        )}`,
      );

      const servicoVinculado =
        await prisma.contratacoes.findFirst({
          where: {
            cliente_id: clienteId,
            prestador_id: prestadorId,
            status: { in: statusLiberados },
          },
        });

      // Ramificação condicional: Vínculo contratual
      if (!servicoVinculado) {
        console.log(
          `[LOG-FLUXO] Bloqueio de contato: Nenhum serviço elegível entre as partes. Protegendo telefone do cliente ${clienteId}.`,
        );
        const { telefone, ...dadosProtegidos } = cliente;
        return {
          ...dadosProtegidos,
          contato_liberado: false,
          mensagem:
            'Aceite o serviço para visualizar os dados de contacto.',
        };
      }

      console.log(
        `[LOG-FLUXO] Contrato válido identificado (ID: ${servicoVinculado.id}). Liberando acesso total aos dados do cliente.`,
      );
      return {
        ...cliente,
        contato_liberado: true,
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha na validação de acesso aos dados do cliente ${clienteId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Recalcula a média de avaliação de um usuário com base no histórico da tabela 'avaliacoes'.
   * @param {string} usuarioId - ID do usuário (geralmente prestador) a ser recalculado.
   * @returns {Promise<number>} - A nova média calculada.
   * @throws {Error} - Falha no cálculo matemático ou persistência no banco.
   */
  static async atualizarMediaAvaliacao(usuarioId: string) {
    console.log(
      `[LOG-FLUXO] Iniciando recalculo de média (atualizarMediaAvaliacao) para o ID: ${usuarioId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Buscando histórico de notas na tabela 'avaliacoes' para o prestador: ${usuarioId}`,
      );
      const avaliacoes = await prisma.avaliacoes.findMany({
        where: { prestador_id: usuarioId },
      });

      // Ramificação condicional: Verificação de volume de dados
      if (avaliacoes.length === 0) {
        console.log(
          `[LOG-FLUXO] Usuário ${usuarioId} ainda não possui avaliações. Mantendo média em 0.`,
        );
        return 0;
      }

      console.log(
        `[LOG-FLUXO] Processando média aritmética sobre amostra de ${avaliacoes.length} registros.`,
      );

      const soma = avaliacoes.reduce((acc, curr) => {
        return acc + (curr.nota ?? 0);
      }, 0);

      const media = soma / avaliacoes.length;

      console.log(
        `[LOG-FLUXO] Nova média apurada: ${media.toFixed(
          2,
        )}. Solicitando persistência no registro do usuário.`,
      );

      // Atualização atômica do campo avaliacao_media
      await prisma.usuarios.update({
        where: { id: usuarioId },
        data: { avaliacao_media: media },
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Média atualizada para o usuário ${usuarioId}.`,
      );
      return media;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro crítico ao atualizar reputação do usuário ${usuarioId}: ${error.message}`,
      );
      throw error;
    }
  }
}

export default ServicePerfil;
