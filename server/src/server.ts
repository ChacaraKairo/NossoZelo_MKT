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
import prisma from './src/lib/prisma';
import logger from './src/lib/logger';
import { ensureProfileFields } from './src/scripts/ensure-profile-fields';

const PORT = process.env.PORT || '4000';
const HOST = process.env.HOST || '0.0.0.0';
const BASE_URL =
  process.env.RENDER_EXTERNAL_URL ||
  process.env.API_URL ||
  `http://localhost:${PORT}`;
const HEALTH_URL = `${BASE_URL.replace(/\/$/, '')}/api/health`;

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
async function triggerDatabasePing() {
  try {
    await prisma.aiven_keep_alive.upsert({
      where: { id: 1 },
      update: { last_ping: new Date() },
      create: { id: 1, last_ping: new Date() },
    });
    logger.debug('Keep-alive do banco executado');
  } catch (error) {
    logger.warn('Keep-alive do banco falhou', {
      error: error instanceof Error ? error.message : error,
    });
  }
}

/**
 * Funcao responsavel por validar a conectividade com o banco de dados.
 */
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('Conexao com banco validada');
  } catch (error: any) {
    logger.error('Falha ao conectar no banco', {
      error: error instanceof Error ? error.message : error,
    });
    process.exit(1);
  }
}

/**
 * Rotina Keep-Alive: impede o sleep do Render e, quando habilitado,
 * o desligamento da Aiven por inatividade.
 */
function startKeepAlive(runDatabasePing: boolean) {
  setInterval(
    async () => {
      try {
        await axios.get(HEALTH_URL);
        if (runDatabasePing) {
          await triggerDatabasePing();
        }
      } catch (error) {
        logger.debug('Keep-alive HTTP falhou', {
          error: error instanceof Error ? error.message : error,
        });
      }
    },
    10 * 60 * 1000,
  );
}

/**
 * Inicia o servidor HTTP depois de validar a conectividade minima.
 */
async function bootstrap() {
  await testDatabaseConnection();
  await ensureProfileFields();

  app.listen(parseInt(PORT), HOST, () => {
    const runAivenKeepAlive = shouldRunAivenKeepAlive();
    logger.info('Servidor NossoZelo iniciado', { host: HOST, port: PORT });

    if (runAivenKeepAlive) {
      void triggerDatabasePing();
    }

    if (process.env.NODE_ENV === 'production') {
      startKeepAlive(runAivenKeepAlive);
    }
  });
}

bootstrap().catch((error: unknown) => {
  logger.error('Falha ao iniciar servidor', {
    error: error instanceof Error ? error.message : error,
  });
  process.exit(1);
});
