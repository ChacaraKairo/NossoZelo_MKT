import ServiceAssinatura from '../service/Service_Assinatura';
import logger from '../lib/logger';
import prisma from '../lib/prisma';

async function main() {
  const resultado = await ServiceAssinatura.expirarAssinaturasSemConfirmacao();
  logger.info('Expiracao de assinaturas pendentes concluida', resultado);
  console.log(
    `Assinaturas pendentes expiradas: ${resultado.expiradas}`,
  );
}

main()
  .catch((error) => {
    logger.error('Falha ao expirar assinaturas pendentes', {
      error: error instanceof Error ? error.message : error,
    });
    console.error('Falha ao expirar assinaturas pendentes.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
