import ServiceAssinatura from '../service/Service_Assinatura';
import logger from '../lib/logger';
import prisma from '../lib/prisma';

async function main() {
  const resultado = await ServiceAssinatura.verificarAssinaturasVencidas();
  logger.info('Job de verificacao de assinaturas concluido', resultado);
  console.log(
    [
      `Assinaturas atrasadas: ${resultado.atrasadas}`,
      `Assinaturas bloqueadas: ${resultado.bloqueadas}`,
      `Assinaturas pendentes expiradas: ${resultado.expiradas}`,
    ].join('\n'),
  );
}

main()
  .catch((error) => {
    logger.error('Falha no job de verificacao de assinaturas', {
      error: error instanceof Error ? error.message : error,
    });
    console.error('Falha no job de verificacao de assinaturas.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
