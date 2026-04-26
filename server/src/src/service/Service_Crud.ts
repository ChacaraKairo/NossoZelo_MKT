/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço genérica para operações de CRUD (Create, Read, Update, Delete) utilizando Prisma,
 * incluindo camadas de segurança para bloqueio de entidades sensíveis e mapeamento dinâmico do esquema do banco.
 * @rota server\src\src\service\Service_Crud.ts
 */

import prisma from '../lib/prisma';

class ServiceCrud {

  /**
   * Verifica se a operação em uma entidade específica deve ser bloqueada por segurança.
   * @param {any} entidade - Nome da tabela/entidade a ser verificada.
   * @returns {Promise<boolean | string>} - Retorna true se permitido, ou uma string de erro se bloqueado.
   */
  static async bloqueia_user(entidade: any) {
    console.log(
      `[LOG-FLUXO] Iniciando bloqueia_user para a entidade: ${entidade}`,
    );

    if (entidade == 'usuario') {
      console.log(
        "[LOG-FLUXO] Bloqueio de segurança ativado: A entidade 'usuario' possui restrições de acesso direto via CRUD genérico.",
      );
      return 'Operação não pode ser realizada por motivos de segurança.';
    } else {
      console.log(
        `[LOG-FLUXO] Verificação concluída: Entidade '${entidade}' permitida para operação.`,
      );
      return true;
    }
  }

  /**
   * Recupera a lista de todas as tabelas existentes no banco de dados através do information_schema.
   * @returns {Promise<any[]>} - Lista contendo os nomes das tabelas do banco de dados.
   * @throws {Error} - Falha na execução da query bruta de metadados.
   */
  static async listar_entidades(): Promise<any[]> {
    console.log(
      '[LOG-FLUXO] Iniciando listar_entidades para mapear o esquema físico do banco de dados.',
    );
    try {
      console.log(
        '[LOG-FLUXO] Executando query bruta (queryRaw) para listar tabelas do information_schema.tables.',
      );
      const result =
        await prisma.$queryRaw`SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`;

      console.log(
        `[LOG-FLUXO] Mapeamento concluído. Total de entidades físicas encontradas: ${
          Array.isArray(result) ? result.length : 0
        }`,
      );
      return result as any[];
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao listar entidades do banco de dados. Detalhes: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Valida se uma entidade existe fisicamente no banco antes de prosseguir com operações dinâmicas.
   * @param {string} entity - Nome da entidade/tabela.
   * @returns {Promise<boolean>} - True se a tabela existir no banco de dados.
   */
  static async checkIfEntityExists(
    entity: string,
  ): Promise<boolean> {
    console.log(
      `[LOG-FLUXO] Verificando existência física da entidade: ${entity} no catálogo do banco.`,
    );

    const tables = await this.listar_entidades();
    const exists = tables.some(
      (table) => table.TABLE_NAME === entity,
    );

    if (exists) {
      console.log(
        `[LOG-FLUXO] Validação positiva: A entidade '${entity}' existe no esquema atual.`,
      );
    } else {
      console.warn(
        `[LOG-FLUXO] Validação negativa: A entidade '${entity}' não foi encontrada no information_schema.`,
      );
    }

    return exists;
  }

  /**
   * Busca um registro único pelo seu identificador primário.
   * @param {string} entity - Nome da tabela no Prisma.
   * @param {string} id - Identificador único do registro.
   * @returns {Promise<any>} - O objeto encontrado ou null.
   * @throws {Error} - Se a entidade não existir ou falha na query.
   */
  static async findById(
    entity: string,
    id: string,
  ): Promise<any> {
    console.log(
      `[LOG-FLUXO] Iniciando findById na entidade: ${entity}, ID: ${id}`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      if (!exists) {
        console.error(
          `[ERRO-FLUXO] Abortando findById: Entidade ${entity} inexistente no esquema físico.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando findUnique dinâmico na entidade: ${entity} para o ID: ${id}`,
      );
      const result = await (prisma as any)[
        entity
      ].findUnique({
        where: { id: id },
      });

      console.log(
        `[LOG-FLUXO] Busca por ID concluída. Status: ${
          result
            ? 'Registro localizado'
            : 'Registro não encontrado'
        }.`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao buscar registro com ID ${id} na entidade ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Busca registros baseados em um campo e valor específicos.
   * @param {string} entity - Nome da tabela.
   * @param {string} field - Nome do campo para filtro.
   * @param {any} value - Valor do filtro.
   * @returns {Promise<any[]>} - Lista de registros encontrados.
   */
  static async findByField(
    entity: string,
    field: string,
    value: any,
  ): Promise<any[]> {
    console.log(
      `[LOG-FLUXO] Iniciando findByField na entidade: ${entity}. Filtro: [${field} = ${value}]`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {
        console.error(
          `[ERRO-FLUXO] Abortando findByField: Falha na validação de permissão ou existência para '${entity}'.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const where = { [field]: value };

      console.log(
        `[LOG-FLUXO] Executando findMany com critério dinâmico na entidade: ${entity}`,
      );
      const result = await (prisma as any)[entity].findMany(
        {
          where,
        },
      );

      console.log(
        `[LOG-FLUXO] findByField concluído. Total de itens retornados: ${result.length}`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha na filtragem dinâmica por campo '${field}' na entidade '${entity}': ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Busca o primeiro registro que satisfaça os critérios fornecidos.
   * @param {string} entity - Nome da tabela.
   * @param {object} where - Objeto de critérios de busca do Prisma.
   */
  static async findFirst(
    entity: string,
    where: object,
  ): Promise<any> {
    console.log(
      `[LOG-FLUXO] Iniciando findFirst na entidade: ${entity}. Critérios: ${JSON.stringify(
        where,
      )}`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {
        console.error(
          `[ERRO-FLUXO] Abortando findFirst: Entidade '${entity}' inválida ou bloqueada.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Solicitando findFirst na entidade: ${entity}`,
      );
      const result = await (prisma as any)[
        entity
      ].findFirst({
        where,
      });

      console.log(
        `[LOG-FLUXO] findFirst finalizado. Registro encontrado: ${
          result ? 'Sim' : 'Não'
        }`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na query findFirst para a entidade ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Retorna todos os registros de uma determinada entidade.
   * @param {string} entity - Nome da tabela.
   */
  static async findAll(entity: string): Promise<any[]> {
    console.log(
      `[LOG-FLUXO] Iniciando findAll na entidade: ${entity}`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {
        console.error(
          `[ERRO-FLUXO] Abortando findAll: Falha de acesso à entidade '${entity}'.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando leitura massiva (findMany) em: ${entity}`,
      );
      const result = await (prisma as any)[
        entity
      ].findMany();

      console.log(
        `[LOG-FLUXO] Listagem completa finalizada. Itens recuperados: ${result.length}`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao buscar todos os registros em ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Cria um novo registro em uma entidade.
   * @param {string} entity - Nome da tabela.
   * @param {object} data - Dados do novo registro.
   */
  static async create(
    entity: string,
    data: object,
  ): Promise<any> {
    console.log(
      `[LOG-FLUXO] Iniciando create na entidade: ${entity}. Dados recebidos: ${JSON.stringify(
        data,
      )}`,
    );

    try {
      if (!(await this.checkIfEntityExists(entity))) {
        console.error(
          `[ERRO-FLUXO] Abortando inserção: Entidade '${entity}' não mapeada.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Persistindo novo registro na entidade: ${entity}`,
      );
      const result = await (prisma as any)[entity].create({
        data,
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Registro persistido em '${entity}'. Novo ID: ${
          result.id || 'Gerado automaticamente'
        }`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao inserir dados na entidade ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Cria múltiplos registros de uma vez (Batch Insert).
   * @param {string} entity - Nome da tabela.
   * @param {object[]} data - Lista de objetos a serem inseridos.
   * @param {boolean} [skipDuplicates=false] - Se deve ignorar erros de duplicidade.
   */
  static async createMany(
    entity: string,
    data: object[],
    skipDuplicates: boolean = false,
  ): Promise<{ count: number }> {
    console.log(
      `[LOG-FLUXO] Iniciando createMany na entidade: ${entity}. Lote de ${data.length} registros.`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      if (!exists) {
        console.error(
          `[ERRO-FLUXO] Abortando processamento em lote para '${entity}'.`,
        );
        throw new Error(
          `Entidade "${entity}" não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando createMany em '${entity}' (Ignorar Duplicados: ${skipDuplicates})`,
      );
      const result = await (prisma as any)[
        entity
      ].createMany({
        data,
        skipDuplicates,
      });

      console.log(
        `[LOG-FLUXO] Operação em lote concluída: ${result.count} novos registros em "${entity}".`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro crítico no createMany para "${entity}": ${error.message}`,
      );
      throw new Error(
        `Erro ao criar múltiplos registros em "${entity}".`,
      );
    }
  }

  /**
   * Atualiza um registro existente via identificador único.
   * @param {string} entity - Nome da tabela.
   * @param {string} id - ID do registro.
   * @param {object} data - Dados para atualização.
   */
  static async update(
    entity: string,
    id: string,
    data: object,
  ): Promise<any> {
    console.log(
      `[LOG-FLUXO] Iniciando update na entidade: ${entity}, ID: ${id}. Patch: ${JSON.stringify(
        data,
      )}`,
    );

    try {
      if (!(await this.checkIfEntityExists(entity))) {
        console.error(
          `[ERRO-FLUXO] Abortando atualização: Entidade '${entity}' não encontrada.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando alteração do registro ${id} em: ${entity}`,
      );
      const result = await (prisma as any)[entity].update({
        where: { id },
        data,
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Registro ${id} atualizado na entidade ${entity}.`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao atualizar o registro ID ${id} em ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Remove um registro fisicamente do banco de dados.
   * @param {string} entity - Nome da tabela.
   * @param {string} id - ID do registro.
   */
  static async delete(
    entity: string,
    id: string,
  ): Promise<any> {
    console.log(
      `[LOG-FLUXO] Iniciando delete na entidade: ${entity}, ID: ${id}`,
    );

    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {
        console.error(
          `[ERRO-FLUXO] Abortando remoção: Entidade '${entity}' inválida ou restrita.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando exclusão física do registro ${id} na entidade ${entity}`,
      );
      const result = await (prisma as any)[entity].delete({
        where: { id },
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Registro ${id} removido da tabela ${entity}.`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao deletar o registro ID ${id} em ${entity}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Realiza busca avançada com múltiplos parâmetros e opções do Prisma.
   * @param {string} entity - Nome da tabela.
   * @param {any} options - Objeto de opções (where, include, select, orderBy, etc).
   */
  static async findMany(
    entity: string,
    options: any,
  ): Promise<any[]> {
    console.log(
      `[LOG-FLUXO] Iniciando findMany parametrizado na entidade: ${entity}. Opções: ${JSON.stringify(
        options,
      )}`,
    );

    try {
      if (!(await this.checkIfEntityExists(entity))) {
        console.error(
          `[ERRO-FLUXO] Abortando consulta: Entidade '${entity}' não localizada.`,
        );
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      console.log(
        `[LOG-FLUXO] Executando findMany com filtros avançados em '${entity}'`,
      );
      const result = await (prisma as any)[entity].findMany(
        options,
      );

      console.log(
        `[LOG-FLUXO] Consulta avançada finalizada. Total de resultados: ${result.length}`,
      );
      return result;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro na query findMany parametrizada para ${entity}: ${error.message}`,
      );
      throw error;
    }
  }
}

export default ServiceCrud;
