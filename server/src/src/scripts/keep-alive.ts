import prisma from '../lib/prisma';

async function aivenKeepAlive() {  try {
    // Upsert garante que a linha existe e a atualiza
    const result = await prisma.aiven_keep_alive.upsert({
      where: { id: 1 },
      update: { last_ping: new Date() },
      create: { id: 1, last_ping: new Date() },
    });  } catch (error) {  } finally {
    await prisma.$disconnect();
  }
}

aivenKeepAlive();
