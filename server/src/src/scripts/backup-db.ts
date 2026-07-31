import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import logger from '../lib/logger';
import { parseDatabaseUrl } from './db-url';

function timestampArquivo() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
}

async function executarBackup() {
  const conexao = parseDatabaseUrl();
  const backupDir =
    process.env.BACKUP_DIR ||
    path.resolve(process.cwd(), 'backups');

  fs.mkdirSync(backupDir, { recursive: true });

  const arquivo = path.join(
    backupDir,
    `nossozelo_${conexao.database}_${timestampArquivo()}.sql`,
  );

  const args = [
    '--format=plain',
    '--no-owner',
    '--no-privileges',
    '--clean',
    '--if-exists',
    '--host',
    conexao.host,
    '--port',
    conexao.port,
    '--username',
    conexao.user,
    '--dbname',
    conexao.database,
  ];

  logger.info('BackupDB: iniciando backup PostgreSQL', {
    host: conexao.host,
    database: conexao.database,
    arquivo,
  });

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(arquivo, {
      flags: 'w',
      encoding: 'utf8',
    });
    const processo = spawn('pg_dump', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      env: {
        ...process.env,
        PGPASSWORD: conexao.password,
      },
    });

    processo.stdout.pipe(output);

    let stderr = '';
    processo.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    processo.on('error', reject);
    processo.on('close', (code) => {
      output.close();

      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `pg_dump finalizou com código ${code}. ${stderr.trim()}`,
        ),
      );
    });
  });

  logger.info('BackupDB: backup concluído', { arquivo });}

executarBackup().catch((error) => {
  logger.error('BackupDB: falha ao gerar backup', {
    erro: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
