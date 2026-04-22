import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function keepAlive() {
  console.log(
    '🚀 [Aiven Keep-Alive] Iniciando pulso de atividade...',
  );
  try {
    // Atualiza ou cria o registro de ID 1 para gerar escrita no disco
    const ping = await prisma.aiven_keep_alive.upsert({
      where: { id: 1 },
      update: { last_ping: new Date() },
      create: { id: 1, last_ping: new Date() },
    });
    console.log(
      `✅ [Aiven Keep-Alive] Sucesso! Banco ativo. Timestamp: ${ping.last_ping}`,
    );
  } catch (error) {
    console.error(
      '❌ [Aiven Keep-Alive] Erro ao realizar ping:',
      error,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

keepAlive();
