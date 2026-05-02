/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço genérica para operações de CRUD (Create, Read, Update, Delete) utilizando Prisma,
 * incluindo camadas de segurança para bloqueio de entidades sensíveis e mapeamento dinâmico do esquema do banco.
 * @rota server\src\src\service\Service_Crud.ts
 */

import prisma from '../lib/prisma';

export const ENTIDADES_CRUD_PERMITIDAS = new Set([
  'especialidades',
  'planos',
  'servicos',
  'relatorios',
]);

export const ENTIDADES_CRUD_BLOQUEADAS = new Set([
  'usuarios',
  'usuario',
  'admins',
  'recuperacao_senhas',
  'confirmacoes_email',
  'logs_acesso',
  'logs_acao',
  'cartoes',
  'dados_bancarios',
  'documentos_cuidadores',
  'assinaturas',
  'pagamentos',
  'eventos_assinatura',
]);

const entidadesComIdNumerico = new Set([
  'agenda',
  'agenda_recorrente',
  'assinaturas',
  'avaliacoes',
  'contratacoes',
  'cuidador_especialidade',
  'denuncias',
  'documentos_cuidadores',
  'especialidades',
  'faturas',
  'logs_acao',
  'logs_acesso',
  'metodos_pagamento',
  'pagamentos',
  'planos',
  'recuperacao_senhas',
  'relatorios',
  'servicos',
  'cartoes',
  'aiven_keep_alive',
]);

class ServiceCrud {
  static normalizarEntidade(entity: string) {
    return String(entity || '').trim();
  }

  static validarEntidadeCrud(entity: string) {
    const entidade = this.normalizarEntidade(entity);

    if (!entidade || entidade.includes('.') || entidade.includes('$')) {
      throw new Error('Entidade invalida para CRUD generico.');
    }

    if (
      ENTIDADES_CRUD_BLOQUEADAS.has(entidade) ||
      !ENTIDADES_CRUD_PERMITIDAS.has(entidade)
    ) {
      throw new Error('Entidade bloqueada para CRUD generico.');
    }

    return entidade;
  }

  static normalizarId(entity: string, id: string) {
    if (!entidadesComIdNumerico.has(entity)) {
      return id;
    }

    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico)) {
      throw new Error(
        `ID invalido para a entidade ${entity}. Era esperado um inteiro.`,
      );
    }

    return idNumerico;
  }

  /**
   * Verifica se a operação em uma entidade específica deve ser bloqueada por segurança.
   * @param {any} entidade - Nome da tabela/entidade a ser verificada.
   * @returns {Promise<boolean | string>} - Retorna true se permitido, ou uma string de erro se bloqueado.
   */
  static async bloqueia_user(entidade: any) {    if (entidade == 'usuario') {      return 'Operação não pode ser realizada por motivos de segurança.';
    } else {      return true;
    }
  }

  /**
   * Recupera a lista de todas as tabelas existentes no banco de dados através do information_schema.
   * @returns {Promise<any[]>} - Lista contendo os nomes das tabelas do banco de dados.
   * @throws {Error} - Falha na execução da query bruta de metadados.
   */
  static async listar_entidades(): Promise<any[]> {    try {      const result =
        await prisma.$queryRaw`SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`;      return (result as any[]).filter((table) =>
        ENTIDADES_CRUD_PERMITIDAS.has(String(table.TABLE_NAME || table.table_name || '')),
      );
    } catch (error: any) {      throw error;
    }
  }

  static async listar_todas_entidades(): Promise<any[]> {    try {      const result =
        await prisma.$queryRaw`SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`;      return result as any[];
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Valida se uma entidade existe fisicamente no banco antes de prosseguir com operações dinâmicas.
   * @param {string} entity - Nome da entidade/tabela.
   * @returns {Promise<boolean>} - True se a tabela existir no banco de dados.
   */
  static async checkIfEntityExists(
    entity: string,
  ): Promise<boolean> {    const tables = await this.listar_todas_entidades();
    const exists = tables.some(
      (table) => table.TABLE_NAME === entity,
    );

    if (exists) {    } else {    }

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
  ): Promise<any> {    try {
      const exists = await this.checkIfEntityExists(entity);
      if (!exists) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[entity].findUnique({
        where: { id: this.normalizarId(entity, id) },
      });      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<any[]> {    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const where = { [field]: value };      const result = await (prisma as any)[entity].findMany(
        {
          where,
        },
      );      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<any> {    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[
        entity
      ].findFirst({
        where,
      });      return result;
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Retorna todos os registros de uma determinada entidade.
   * @param {string} entity - Nome da tabela.
   */
  static async findAll(entity: string): Promise<any[]> {    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[
        entity
      ].findMany();      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<any> {    try {
      if (!(await this.checkIfEntityExists(entity))) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[entity].create({
        data,
      });      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<{ count: number }> {    try {
      const exists = await this.checkIfEntityExists(entity);
      if (!exists) {        throw new Error(
          `Entidade "${entity}" não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[
        entity
      ].createMany({
        data,
        skipDuplicates,
      });      return result;
    } catch (error: any) {      throw new Error(
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
  ): Promise<any> {    try {
      if (!(await this.checkIfEntityExists(entity))) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[entity].update({
        where: { id: this.normalizarId(entity, id) },
        data,
      });      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<any> {    try {
      const exists = await this.checkIfEntityExists(entity);
      const isBlocked = await this.bloqueia_user(entity);

      if (!exists && isBlocked !== true) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[entity].delete({
        where: { id: this.normalizarId(entity, id) },
      });      return result;
    } catch (error: any) {      throw error;
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
  ): Promise<any[]> {    try {
      if (!(await this.checkIfEntityExists(entity))) {        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }      const result = await (prisma as any)[entity].findMany(
        options,
      );      return result;
    } catch (error: any) {      throw error;
    }
  }
}

export default ServiceCrud;
