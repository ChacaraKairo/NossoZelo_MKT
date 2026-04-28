/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Service especializado na gestão de Prova Social e Segurança.
 * Orquestra a criação de avaliações e garante a atualização da reputação dos prestadores no banco MySQL.
 */

import {
  contratacoes_status,
} from '@prisma/client';
import prisma from '../lib/prisma';
import { ServicePerfil } from './Service_Perfil';
import { STATUS_CONTRATACAO } from '../constants/dominio';

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

class ServiceAvaliacao {
  /**
   * Registra uma avaliação e atualiza a média aritmética do prestador.
   * A unicidade é garantida pelo vínculo com a contratação (contratacao_id).
   * @param {any} data - Objeto contendo contratacao_id, cliente_id, prestador_id, nota e comentário.
   * @returns {Promise<any>} - O registro da avaliação persistido.
   * @throws {Error} - Lança erro em caso de falha na persistência ou no recálculo da média.
   */
  static async registrarAvaliacao(data: any) {
    console.log(
      `[LOG-FLUXO] Iniciando registrarAvaliacao para a Contratação ID: ${data.contratacao_id}`,
    );

    try {
      const contratacaoId = Number(data.contratacao_id);
      const nota = Number(data.nota);

      if (!Number.isInteger(contratacaoId)) {
        throw erroNegocio('Contratacao invalida.', 400);
      }

      if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
        throw erroNegocio('A nota deve estar entre 1 e 5.', 400);
      }

      const cliente = await prisma.usuarios.findUnique({
        where: { id: data.cliente_id },
        select: { email_confirmado: true },
      });

      if (!cliente?.email_confirmado) {
        throw erroNegocio(
          'Confirme seu e-mail para avaliar serviços.',
          403,
        );
      }

      const contratacao =
        await prisma.contratacoes.findUnique({
          where: { id: contratacaoId },
        });

      if (!contratacao) {
        throw erroNegocio('Contratacao nao encontrada.', 404);
      }

      if (contratacao.cliente_id !== data.cliente_id) {
        throw erroNegocio('A contratacao nao pertence ao cliente autenticado.', 403);
      }

      if (contratacao.prestador_id !== data.prestador_id) {
        throw erroNegocio('Prestador informado nao corresponde a contratacao.', 400);
      }

      if (
        contratacao.status !==
        (STATUS_CONTRATACAO.concluido as contratacoes_status)
      ) {
        throw erroNegocio('A contratacao precisa estar concluida para ser avaliada.', 409);
      }

      const avaliacaoExistente =
        await prisma.avaliacoes.findUnique({
          where: { contratacao_id: contratacaoId },
          select: { id: true },
        });

      if (avaliacaoExistente) {
        throw erroNegocio('Esta contratacao ja possui avaliacao.', 409);
      }

      /**
       * 1. PERSISTÊNCIA DA AVALIAÇÃO
       * Realiza o cast explícito para Number para evitar conflitos de tipo com o driver MySQL.
       */
      console.log(
        `[LOG-FLUXO] Inserindo nota ${data.nota} para o prestador ${data.prestador_id} na tabela 'avaliacoes'.`,
      );

      const novaAvaliacao = await prisma.avaliacoes.create({
        data: {
          contratacao_id: contratacaoId,
          cliente_id: data.cliente_id,
          prestador_id: data.prestador_id,
          tipo_prestador: contratacao.tipo_prestador,
          nota,
          comentario: data.comentario,
        },
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Avaliação ${novaAvaliacao.id} persistida. Iniciando gatilho de reputação.`,
      );

      /**
       * 2. ATUALIZAÇÃO ATÔMICA DA MÉDIA
       * Reaproveita a lógica centralizada no ServicePerfil para manter a consistência da vitrine.
       */
      console.log(
        `[LOG-FLUXO] Solicitando recálculo de média ao ServicePerfil para o ID: ${data.prestador_id}`,
      );

      await ServicePerfil.atualizarMediaAvaliacao(
        data.prestador_id,
      );

      console.log(
        '[LOG-FLUXO] Fluxo de registro de avaliação e atualização de média concluído.',
      );

      return novaAvaliacao;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao registrar avaliação para a contratação ${data.contratacao_id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * LEITURA: Procura todos os feedbacks de um prestador.
   * Centraliza como as avaliações são apresentadas (ordem, campos do cliente, etc).
   * @param {string} prestadorId - Identificador único do prestador.
   * @returns {Promise<any[]>} - Lista de avaliações ordenadas com dados dos clientes.
   */
  static async obterAvaliacoesPorPrestador(
    prestadorId: string,
  ) {
    console.log(
      `[LOG-FLUXO] Iniciando obterAvaliacoesPorPrestador para o Prestador ID: ${prestadorId}`,
    );

    try {
      const avaliacoes = await prisma.avaliacoes.findMany({
        where: { prestador_id: prestadorId },
        include: {
          // Traz dados básicos de quem avaliou para a UI
          usuarios_avaliacoes_cliente_idTousuarios: {
            select: {
              nome: true,
              url_foto_perfil: true,
            },
          },
        },
        orderBy: { data_avaliacao: 'desc' },
      });

      console.log(
        `[LOG-FLUXO] Busca de avaliações concluída. Total encontrado: ${avaliacoes.length}`,
      );

      return avaliacoes;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao recuperar avaliações para o prestador ${prestadorId}: ${error.message}`,
      );
      throw new Error(
        `Erro ao procurar avaliações: ${error.message}`,
      );
    }
  }
}

export default ServiceAvaliacao;
