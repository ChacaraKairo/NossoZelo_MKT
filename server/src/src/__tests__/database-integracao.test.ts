import { PrismaClient } from '@prisma/client';
import { describe, expect, it } from 'vitest';

const describeDb = process.env.TEST_DATABASE_URL ? describe : describe.skip;

describeDb('integracao com banco de teste', () => {
  it('conecta e valida tabela de eventos financeiros', async () => {
    const prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL },
      },
    });

    try {
      const tabelas = await prisma.$queryRawUnsafe<Array<{ TABLE_NAME: string }>>(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eventos_assinatura'",
      );
      const colunas = await prisma.$queryRawUnsafe<Array<{ COLUMN_NAME: string }>>(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'eventos_assinatura'",
      );

      expect(tabelas.length).toBe(1);
      expect(colunas.map((item) => item.COLUMN_NAME)).toEqual(
        expect.arrayContaining([
          'gateway_event_id',
          'payload_hash',
          'payload_resumo',
          'processado_em',
        ]),
      );
    } finally {
      await prisma.$disconnect();
    }
  });
});

