/**
 * @author Kairo Chacara
 * @version 1.2
 * @date 21/04/2026
 * @description Ponto de entrada (Bootstrap) com rotinas Keep-Alive para Render e Aiven.
 * @rota server\src\server
 */

import dotenv from 'dotenv';

dotenv.config();

import app from './main';
import axios from 'axios';
import { exec } from 'child_process';
import prisma from './src/lib/prisma';

console.log('[LOG-FLUXO] Iniciando o bootstrap da aplicacao.');

const PORT = process.env.PORT || '4000';
const HOST = process.env.HOST || '0.0.0.0';
const SERVER_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.API_URL ||
  `http://localhost:${PORT}`;

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET nao configurado. O servidor nao pode iniciar com chave JWT padrao.',
  );
}

function shouldRunAivenKeepAlive() {
  if (process.env.ENABLE_AIVEN_KEEP_ALIVE === 'true') {
    return true;
  }

  if (process.env.ENABLE_AIVEN_KEEP_ALIVE === 'false') {
    return false;
  }

  return (
    process.env.NODE_ENV === 'production' &&
    Boolean(process.env.DATABASE_URL?.includes('aivencloud.com'))
  );
}

/**
 * Executa o script de manutencao do banco de dados Aiven.
 */
function triggerDatabasePing() {
  exec('npm run db:keep-alive', (error, stdout) => {
    if (error) {
      console.error(
        `[ERRO-AIVEN] Falha ao pulsar o banco: ${error.message}`,
      );
      return;
    }

    if (stdout) {
      console.log(`[LOG-AIVEN] ${stdout.trim()}`);
    }
  });
}

/**
 * Funcao responsavel por validar a conectividade com o banco de dados.
 */
async function testDatabaseConnection() {
  console.log(
    '[LOG-FLUXO] Validando conectividade com o banco de dados...',
  );

  try {
    await prisma.$connect();
    console.log(
      '[LOG-FLUXO] Sucesso: Conexao com o banco de dados estabelecida.',
    );
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Falha critica no banco de dados: ${error.message || error}`,
    );
    process.exit(1);
  }
}

/**
 * Rotina Keep-Alive: impede o sleep do Render e, quando habilitado,
 * o desligamento da Aiven por inatividade.
 */
function startKeepAlive(runDatabasePing: boolean) {
  console.log(
    `[LOG-FLUXO] Configurando rotina Keep-Alive para: ${SERVER_URL}`,
  );

  setInterval(
    async () => {
      try {
        await axios.get(SERVER_URL);
        console.log(
          '[LOG-FLUXO] Keep-Alive: Servidor Render acordado.',
        );

        if (runDatabasePing) {
          triggerDatabasePing();
        }
      } catch {
        console.warn(
          '[LOG-FLUXO] Keep-Alive: Falha no ping autonomo.',
        );
      }
    },
    10 * 60 * 1000,
  );
}

/**
 * Inicia o servidor HTTP.
 */
app.listen(parseInt(PORT), HOST, async () => {
  console.log(
    `[LOG-FLUXO] Servidor Express disparado em ${HOST}:${PORT}.`,
  );

  await testDatabaseConnection();

  const runAivenKeepAlive = shouldRunAivenKeepAlive();

  if (runAivenKeepAlive) {
    triggerDatabasePing();
  }

  if (process.env.NODE_ENV === 'production') {
    startKeepAlive(runAivenKeepAlive);
  }

  console.log(
    `[LOG-FLUXO] Bootstrap finalizado. Operacional em: ${SERVER_URL}`,
  );
});
