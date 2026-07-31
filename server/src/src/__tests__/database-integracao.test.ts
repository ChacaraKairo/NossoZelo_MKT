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
      const tabelas = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'eventos_assinatura'",
      );
      const colunas = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'eventos_assinatura'",
      );

      expect(tabelas.length).toBe(1);
      expect(colunas.map((item) => item.column_name)).toEqual(
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
