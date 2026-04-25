"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function aivenKeepAlive() {
    console.log('[Aiven Keep-Alive] Iniciando ping de atividade...');
    try {
        // Upsert garante que a linha existe e a atualiza
        const result = await prisma.aiven_keep_alive.upsert({
            where: { id: 1 },
            update: { last_ping: new Date() },
            create: { id: 1, last_ping: new Date() },
        });
        console.log(`[Aiven Keep-Alive] Sucesso! Banco ativo em: ${result.last_ping}`);
    }
    catch (error) {
        console.error('[Aiven Keep-Alive] Erro ao conectar:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
aivenKeepAlive();
