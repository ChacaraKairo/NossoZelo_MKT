import ServiceCrud from './Service_Crud';

class ServiceAgendamento {
  /**
   * Cria uma contratação.
   * O agendamento será criado automaticamente por um gatilho no banco.
   */
  static async criarAgendamento(data: any) {
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

    // Criar apenas a contratação; o agendamento será gerado automaticamente
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

    return contratacao;
  }

  /**
   * Lista os agendamentos de um prestador dentro de um intervalo de tempo (em dias)
   */
  static async listar_agendamentos_por_tempo(
    tempoEmDias: number,
    prestadorId: string,
  ) {
    const hoje = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(hoje.getDate() - tempoEmDias);

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

    return agendamentos;
  }

  /**
   * Lista todas as contratações feitas por um cliente
   */
  static async agendamentos_cliente(clienteId: string) {
    const agendamentos = await ServiceCrud.findByField(
      'contratacoes',
      'cliente_id',
      clienteId,
    );
    return agendamentos;
  }
}

export default ServiceAgendamento;
