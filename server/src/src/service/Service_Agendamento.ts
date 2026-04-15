/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela orquestração de contratações e agendamentos,
 * gerenciando a persistência na tabela de contratações e consultas temporais na agenda dos prestadores.
 * @route server\src\src\service\Service_Agendamento.ts
 */

import ServiceCrud from './Service_Crud';

class ServiceAgendamento {
  /**
   * Cria uma nova contratação no sistema.
   * Nota: O registro na tabela 'agenda' é gerado automaticamente via trigger no banco de dados.
   * @param {any} data - Objeto contendo dados da contratação (cliente_id, prestador_id, preco, etc).
   * @returns {Promise<any>} - O registro da contratação criada.
   * @throws {Error} - Falha na persistência ou validação dos dados.
   */
  static async criarAgendamento(data: any) {
    console.log(
      `[LOG-FLUXO] Iniciando criarAgendamento. Payload recebido: ${JSON.stringify(
        data,
      )}`,
    );

    const {
      cliente_id,
      prestador_id,
      tipo_prestador,
      data: dataAgendamento,
      hora_inicio,
      hora_fim,
      preco,
      observacoes,
    } = data;

    try {
      console.log(
        `[LOG-FLUXO] Preparando inserção de nova contratação. Cliente Contexto: ${cliente_id}, Prestador Contexto: ${prestador_id}`,
      );

      // Criar apenas a contratação; o agendamento será gerado automaticamente por gatilho (DB Trigger)
      console.log(
        "[LOG-FLUXO] Invocando ServiceCrud.create para a entidade 'contratacoes'.",
      );
      const contratacao = await ServiceCrud.create(
        'contratacoes',
        {
          cliente_id,
          prestador_id,
          tipo_prestador,
          data: dataAgendamento,
          hora_inicio,
          hora_fim,
          preco,
          status: 'pendente',
          observacoes,
        },
      );

      console.log(
        `[LOG-FLUXO] Sucesso: Contratação ID ${contratacao.id} criada com status: ${contratacao.status}.`,
      );
      return contratacao;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao registrar contratação para o cliente ${cliente_id}: ${
          error.message || error
        }. Detalhes da tentativa abortada.`,
      );
      throw error;
    }
  }

  /**
   * Recupera o histórico de agendamentos de um prestador filtrado por um intervalo de dias retroativos.
   * @param {number} tempoEmDias - Quantidade de dias para olhar para trás no calendário.
   * @param {string} prestadorId - UUID do prestador.
   * @returns {Promise<any[]>} - Lista de registros da agenda.
   * @throws {Error} - Falha na consulta parametrizada.
   */
  static async listar_agendamentos_por_tempo(
    tempoEmDias: number,
    prestadorId: string,
  ) {
    console.log(
      `[LOG-FLUXO] Iniciando listar_agendamentos_por_tempo. Filtros -> Dias: ${tempoEmDias}, PrestadorID: ${prestadorId}`,
    );

    try {
      const hoje = new Date();
      const dataInicial = new Date();
      dataInicial.setDate(hoje.getDate() - tempoEmDias);

      console.log(
        `[LOG-FLUXO] Definindo janela temporal de busca: ${dataInicial.toISOString()} até ${hoje.toISOString()}`,
      );

      console.log(
        "[LOG-FLUXO] Consultando ServiceCrud.findMany na tabela 'agenda' com filtros de data (gte/lte).",
      );
      const agendamentos = await ServiceCrud.findMany(
        'agenda',
        {
          where: {
            prestador_id: prestadorId,
            data: {
              gte: dataInicial,
              lte: hoje,
            },
          },
        },
      );

      // Ramificação condicional: Verificação de volume de resultados
      if (agendamentos && agendamentos.length > 0) {
        console.log(
          `[LOG-FLUXO] Operação concluída. ${agendamentos.length} agendamentos localizados para o prestador ${prestadorId}.`,
        );
      } else {
        console.log(
          `[LOG-FLUXO] Operação concluída. Nenhum registro encontrado na 'agenda' para o prestador ${prestadorId} no período solicitado.`,
        );
      }

      return agendamentos;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha na listagem cronológica de agendamentos (Prestador: ${prestadorId}): ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Retorna todas as contratações vinculadas a um cliente específico.
   * @param {string} clienteId - UUID do cliente solicitante.
   * @returns {Promise<any[]>} - Lista de contratações.
   * @throws {Error} - Erro na filtragem por campo.
   */
  static async agendamentos_cliente(clienteId: string) {
    console.log(
      `[LOG-FLUXO] Iniciando agendamentos_cliente para recuperar histórico do ClienteID: ${clienteId}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Executando ServiceCrud.findByField na entidade 'contratacoes' para o vínculo cliente_id: ${clienteId}`,
      );

      const agendamentos = await ServiceCrud.findByField(
        'contratacoes',
        'cliente_id',
        clienteId,
      );

      console.log(
        `[LOG-FLUXO] Busca finalizada com sucesso. Registros retornados para o cliente ${clienteId}: ${
          agendamentos ? agendamentos.length : 0
        }`,
      );
      return agendamentos;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao recuperar histórico de contratações do cliente ${clienteId}: ${error.message}`,
      );
      throw error;
    }
  }
}

export default ServiceAgendamento;
