"use strict";
/**
 * @author Kairo Chácara
 * @version 1.2
 * @date 21/04/2026
 * @description Ponto de entrada (Bootstrap) com rotinas Keep-Alive para Render e Aiven.
 * @rota server\src\server
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Carregamento imediato das variáveis de ambiente
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const main_1 = __importDefault(require("./main"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process"); // Importado para executar o ping do banco
console.log('[LOG-FLUXO] Iniciando o bootstrap da aplicação.');
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || '4000';
const link = process.env.LINK || 'http://localhost';
// Link do Render para o auto-ping
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || `${link}:${PORT}`;
/**
 * Executa o script de manutenção do banco de dados Aiven
 */
function triggerDatabasePing() {
    (0, child_process_1.exec)('npm run db:keep-alive', (error, stdout) => {
        if (error) {
            console.error(`[ERRO-AIVEN] Falha ao pulsar o banco: ${error.message}`);
            return;
        }
        if (stdout)
            console.log(`[LOG-AIVEN] ${stdout.trim()}`);
    });
}
/**
 * Função responsável por validar a conectividade com o banco de dados.
 */
async function testDatabaseConnection() {
    console.log('[LOG-FLUXO] Validando conectividade com o banco de dados...');
    try {
        await prisma.$connect();
        console.log('[LOG-FLUXO] ✅ Sucesso: Conexão com o banco de dados estabelecida.');
    }
    catch (error) {
        console.error(`[ERRO-FLUXO] Falha crítica no banco de dados: ${error.message || error}`);
        process.exit(1);
    }
}
/**
 * Rotina Keep-Alive: Impede o Sleep do Render e o desligamento da Aiven.
 */
function startKeepAlive() {
    console.log(`[LOG-FLUXO] Configurando rotina Keep-Alive para: ${RENDER_URL}`);
    // Intervalo de 10 minutos
    setInterval(async () => {
        try {
            // 1. Mantém o Render acordado
            await axios_1.default.get(RENDER_URL);
            console.log('[LOG-FLUXO] 💓 Keep-Alive: Servidor Render acordado.');
            // 2. Aproveita o ciclo para pulsar o banco de dados (Aiven)
            // Nota: O banco só precisa de atividade a cada algumas horas,
            // mas rodar aqui garante segurança total.
            triggerDatabasePing();
        }
        catch (error) {
            console.warn('[LOG-FLUXO] ⚠️ Keep-Alive: Falha no ping autônomo.');
        }
    }, 10 * 60 * 1000);
}
/**
 * Inicia o servidor HTTP
 */
main_1.default.listen(parseInt(PORT), async () => {
    console.log(`[LOG-FLUXO] Servidor Express disparado na porta: ${PORT}.`);
    // 1. Valida Banco de Dados
    await testDatabaseConnection();
    // 2. Pulso inicial no banco de dados Aiven
    triggerDatabasePing();
    // 3. Inicia rotina para não deixar o Render dormir em produção
    if (process.env.NODE_ENV === 'production') {
        startKeepAlive();
    }
    console.log(`[LOG-FLUXO] Bootstrap finalizado. 🚀 Operacional em: ${RENDER_URL}`);
});
