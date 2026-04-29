import prisma from '../lib/prisma';

async function keepAlive() {  try {
    // Atualiza ou cria o registro de ID 1 para gerar escrita no disco
    const ping = await prisma.aiven_keep_alive.upsert({
      where: { id: 1 },
      update: { last_ping: new Date() },
      create: { id: 1, last_ping: new Date() },
    });  } catch (error) {    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

keepAlive();
