/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Ponto de entrada (Bootstrap) da aplicação com rotina Keep-Alive para Render.
 * @rota server\src\server
 */

import dotenv from 'dotenv';
// Carregamento imediato das variáveis de ambiente
dotenv.config();

import { PrismaClient } from '@prisma/client';
import app from './main';
import axios from 'axios'; // Certifique-se de ter o axios instalado (npm install axios)

console.log(
  '[LOG-FLUXO] Iniciando o bootstrap da aplicação.',
);

const prisma = new PrismaClient();
const PORT = process.env.PORT || '4000';
const link = process.env.LINK || 'http://localhost';
// Link do Render para o auto-ping
const RENDER_URL =
  process.env.RENDER_EXTERNAL_URL || `${link}:${PORT}`;

/**
 * Função responsável por validar a conectividade com o banco de dados.
 */
async function testDatabaseConnection() {
  console.log(
    '[LOG-FLUXO] Validando conectividade com o banco de dados...',
  );
  try {
    await prisma.$connect();
    console.log(
      '[LOG-FLUXO] ✅ Sucesso: Conexão com o banco de dados estabelecida.',
    );
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Falha crítica no banco de dados: ${error.message || error}`,
    );
    process.exit(1);
  }
}

/**
 * Rotina Keep-Alive: Impede que o Render entre em modo Sleep (plano Free).
 * Realiza um ping interno a cada 10 minutos.
 */
function startKeepAlive() {
  console.log(
    `[LOG-FLUXO] Configurando rotina Keep-Alive para: ${RENDER_URL}`,
  );

  setInterval(
    async () => {
      try {
        // Faz um ping na rota raiz ou em um endpoint de health check
        await axios.get(RENDER_URL);
        console.log(
          '[LOG-FLUXO] 💓 Keep-Alive: Ping enviado com sucesso para manter o servidor acordado.',
        );
      } catch (error: any) {
        console.warn(
          '[LOG-FLUXO] ⚠️ Keep-Alive: Falha ao enviar ping autônomo (servidor pode estar iniciando).',
        );
      }
    },
    10 * 60 * 1000,
  ); // 10 minutos
}

/**
 * Inicia o servidor HTTP
 */
app.listen(parseInt(PORT), async () => {
  console.log(
    `[LOG-FLUXO] Servidor Express disparado na porta: ${PORT}.`,
  );

  // 1. Valida Banco de Dados
  await testDatabaseConnection();

  // 2. Inicia rotina para não deixar o Render dormir
  if (process.env.NODE_ENV === 'production') {
    startKeepAlive();
  }

  console.log(
    `[LOG-FLUXO] Bootstrap finalizado. 🚀 Operacional em: ${RENDER_URL}`,
  );
});
