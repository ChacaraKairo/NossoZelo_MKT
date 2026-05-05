import net from 'net';

type ScanResultado =
  | { seguro: true; detalhe: string }
  | { seguro: false; detalhe: string };

function scanMode() {
  return (process.env.UPLOAD_SCAN_MODE || 'disabled').trim().toLowerCase();
}

function clamavHost() {
  return process.env.CLAMAV_HOST || '127.0.0.1';
}

function clamavPort() {
  return Number(process.env.CLAMAV_PORT || 3310);
}

function clamavTimeoutMs() {
  return Number(process.env.CLAMAV_TIMEOUT_MS || 15000);
}

function dividirBuffer(buffer: Buffer, tamanho = 64 * 1024) {
  const partes: Buffer[] = [];
  for (let inicio = 0; inicio < buffer.length; inicio += tamanho) {
    partes.push(buffer.subarray(inicio, inicio + tamanho));
  }
  return partes;
}

function tamanhoChunk(tamanho: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(tamanho, 0);
  return buffer;
}

async function scanComClamav(buffer: Buffer): Promise<ScanResultado> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host: clamavHost(),
      port: clamavPort(),
    });
    const chunksResposta: Buffer[] = [];
    let finalizado = false;

    const encerrar = (callback: () => void) => {
      if (finalizado) return;
      finalizado = true;
      socket.destroy();
      callback();
    };

    socket.setTimeout(clamavTimeoutMs());
    socket.on('timeout', () =>
      encerrar(() =>
        reject(new Error('Timeout ao verificar arquivo no ClamAV.')),
      ),
    );
    socket.on('error', (error) => encerrar(() => reject(error)));
    socket.on('data', (chunk) => chunksResposta.push(Buffer.from(chunk)));
    socket.on('end', () => {
      encerrar(() => {
        const resposta = Buffer.concat(chunksResposta).toString('utf8');
        if (/\bOK\b/.test(resposta)) {
          resolve({ seguro: true, detalhe: resposta.trim() });
          return;
        }

        resolve({
          seguro: false,
          detalhe: resposta.trim() || 'Arquivo rejeitado pelo scanner.',
        });
      });
    });

    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      for (const parte of dividirBuffer(buffer)) {
        socket.write(tamanhoChunk(parte.length));
        socket.write(parte);
      }
      socket.write(tamanhoChunk(0));
    });
  });
}

export async function verificarArquivoSeguro(
  arquivo: Express.Multer.File,
): Promise<ScanResultado> {
  const mode = scanMode();

  if (mode === 'disabled') {
    return { seguro: true, detalhe: 'scanner_desabilitado' };
  }

  if (mode === 'clamav') {
    return scanComClamav(arquivo.buffer);
  }

  throw new Error(`UPLOAD_SCAN_MODE invalido: ${mode}.`);
}

export function uploadScannerObrigatorioEmProducao() {
  return process.env.NODE_ENV === 'production' && process.env.ENABLE_UPLOADS === 'true';
}
