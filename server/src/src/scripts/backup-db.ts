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
    '--single-transaction',
    '--quick',
    '--routines',
    '--triggers',
    '--default-character-set=utf8mb4',
    '-h',
    conexao.host,
    '-P',
    conexao.port,
    '-u',
    conexao.user,
    `-p${conexao.password}`,
    conexao.database,
  ];

  logger.info('BackupDB: iniciando backup MySQL', {
    host: conexao.host,
    database: conexao.database,
    arquivo,
  });

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(arquivo, {
      flags: 'w',
      encoding: 'utf8',
    });
    const processo = spawn('mysqldump', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
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
          `mysqldump finalizou com código ${code}. ${stderr.trim()}`,
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
