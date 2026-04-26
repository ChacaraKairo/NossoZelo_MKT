import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import logger from '../lib/logger';
import { parseDatabaseUrl } from './db-url';

function obterArquivoBackup() {
  const arquivo = process.argv[2] || process.env.BACKUP_FILE;

  if (!arquivo) {
    throw new Error(
      'Informe o arquivo SQL: npm run db:restore -- ./backups/arquivo.sql',
    );
  }

  const caminho = path.resolve(process.cwd(), arquivo);

  if (!fs.existsSync(caminho)) {
    throw new Error(`Arquivo de backup não encontrado: ${caminho}`);
  }

  if (!caminho.endsWith('.sql')) {
    throw new Error('A restauração aceita apenas arquivos .sql.');
  }

  return caminho;
}

async function executarRestore() {
  const conexao = parseDatabaseUrl();
  const arquivo = obterArquivoBackup();

  const args = [
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

  logger.warn('RestoreDB: iniciando restauração MySQL', {
    host: conexao.host,
    database: conexao.database,
    arquivo,
  });

  await new Promise<void>((resolve, reject) => {
    const input = fs.createReadStream(arquivo, { encoding: 'utf8' });
    const processo = spawn('mysql', args, {
      stdio: ['pipe', 'ignore', 'pipe'],
      shell: false,
    });

    input.pipe(processo.stdin);

    let stderr = '';
    processo.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    processo.on('error', reject);
    processo.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `mysql finalizou com código ${code}. ${stderr.trim()}`,
        ),
      );
    });
  });

  logger.info('RestoreDB: restauração concluída', { arquivo });
}

executarRestore().catch((error) => {
  logger.error('RestoreDB: falha ao restaurar backup', {
    erro: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
