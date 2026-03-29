import { PrismaClient } from '@prisma/client';

class ServiceCrud {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  static async bloqueia_user(entidade: any) {
    if (entidade == 'usuario') {
      return 'Operação não pode ser realizada por motivos de segurança.';
    } else {
      return true;
    }
  }

  static async listar_entidades(): Promise<any[]> {
    const prisma = new PrismaClient();
    return await prisma.$queryRaw`SELECT table_name AS TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`;
  }

  static async checkIfEntityExists(
    entity: string,
  ): Promise<boolean> {
    const tables = await this.listar_entidades();
    return tables.some(
      (table) => table.TABLE_NAME === entity,
    );
  }

  static async findById(
    entity: string,
    id: string,
  ): Promise<any> {
    try {
      if (!(await this.checkIfEntityExists(entity))) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].findUnique({
        where: { id: id },
      });
    } catch (error) {
      console.error(
        `Erro ao buscar registro com ID ${id} na entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }

  static async findByField(
    entity: string,
    field: string,
    value: any,
  ): Promise<any[]> {
    try {
      if (
        !(await this.checkIfEntityExists(entity)) &&
        !(await this.bloqueia_user(entity))
      ) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      const where = { [field]: value };
      return await (prisma as any)[entity].findMany({
        where,
      });
    } catch (error) {
      console.error(
        `Erro ao buscar registros por ${field} na entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }

  static async findAll(entity: string): Promise<any[]> {
    try {
      if (
        !(await this.checkIfEntityExists(entity)) &&
        !(await this.bloqueia_user(entity))
      ) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].findMany();
    } catch (error) {
      console.error(
        `Erro ao buscar todos os registros da entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }

  static async create(
    entity: string,
    data: object,
  ): Promise<any> {
    try {
      if (!(await this.checkIfEntityExists(entity))) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].create({ data });
    } catch (error) {
      console.error(
        `Erro ao criar registro na entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }

  static async createMany(
    entity: string,
    data: object[],
    skipDuplicates: boolean = false,
  ): Promise<{ count: number }> {
    try {
      const exists = await this.checkIfEntityExists(entity);
      if (!exists) {
        throw new Error(
          `Entidade "${entity}" não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      const result = await (prisma as any)[
        entity
      ].createMany({
        data,
        skipDuplicates,
      });

      console.log(
        `✅ ${result.count} registros criados em "${entity}".`,
      );
      return result;
    } catch (error) {
      console.error(
        `❌ Erro ao criar registros em "${entity}":`,
        error,
      );
      throw new Error(
        `Erro ao criar múltiplos registros em "${entity}".`,
      );
    }
  }

  static async update(
    entity: string,
    id: string,
    data: object,
  ): Promise<any> {
    try {
      if (!(await this.checkIfEntityExists(entity))) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error(
        `Erro ao atualizar registro com ID ${id} na entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }

  static async delete(
    entity: string,
    id: string,
  ): Promise<any> {
    try {
      if (
        !(await this.checkIfEntityExists(entity)) &&
        !(await this.bloqueia_user(entity))
      ) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].delete({
        where: { id },
      });
    } catch (error) {
      console.error(
        `Erro ao deletar registro com ID ${id} na entidade ${entity}: `,
        error,
      );
      throw error;
    }
  }
  static async findMany(
    entity: string,
    options: any, // pode conter `where`, `orderBy`, `take`, `skip`, etc.
  ): Promise<any[]> {
    try {
      if (!(await this.checkIfEntityExists(entity))) {
        throw new Error(
          `Entidade ${entity} não existe no banco de dados.`,
        );
      }

      const prisma = new PrismaClient();
      return await (prisma as any)[entity].findMany(
        options,
      );
    } catch (error) {
      console.error(
        `Erro ao buscar múltiplos registros em "${entity}":`,
        error,
      );
      throw error;
    }
  }
}

export default ServiceCrud;
