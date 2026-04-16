/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Service especializado na gestão de Prova Social e Segurança.
 * Orquestra a criação de avaliações e garante a atualização da reputação dos prestadores no banco MySQL.
 */

import { PrismaClient } from '@prisma/client';
import { ServicePerfil } from './Service_Perfil';

console.log(
  '[LOG-FLUXO] Inicializando PrismaClient para o ServiceAvaliacao.',
);
const prisma = new PrismaClient();

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
      /**
       * 1. PERSISTÊNCIA DA AVALIAÇÃO
       * Realiza o cast explícito para Number para evitar conflitos de tipo com o driver MySQL.
       */
      console.log(
        `[LOG-FLUXO] Inserindo nota ${data.nota} para o prestador ${data.prestador_id} na tabela 'avaliacoes'.`,
      );

      const novaAvaliacao = await prisma.avaliacoes.create({
        data: {
          contratacao_id: Number(data.contratacao_id),
          cliente_id: data.cliente_id,
          prestador_id: data.prestador_id,
          tipo_prestador: data.tipo_prestador,
          nota: Number(data.nota),
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
}

export default ServiceAvaliacao;
