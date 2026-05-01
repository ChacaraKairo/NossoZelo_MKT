import logger from '../lib/logger';
import prisma from '../lib/prisma';

async function main() {
  const agora = new Date();
  const [confirmacoesEmail, recuperacoesSenha] = await prisma.$transaction([
    prisma.confirmacoes_email.deleteMany({
      where: {
        OR: [{ expiracao: { lt: agora } }, { usado: true }],
      },
    }),
    prisma.recuperacao_senhas.deleteMany({
      where: {
        OR: [{ expiracao: { lt: agora } }, { usado: true }],
      },
    }),
  ]);

  const resultado = {
    confirmacoes_email_removidas: confirmacoesEmail.count,
    recuperacoes_senha_removidas: recuperacoesSenha.count,
  };

  logger.info('Limpeza de tokens concluida', resultado);
  console.log(
    [
      `Confirmacoes de e-mail removidas: ${resultado.confirmacoes_email_removidas}`,
      `Tokens de recuperacao removidos: ${resultado.recuperacoes_senha_removidas}`,
    ].join('\n'),
  );
}

main()
  .catch((error) => {
    logger.error('Falha na limpeza de tokens', {
      error: error instanceof Error ? error.message : error,
    });
    console.error('Falha na limpeza de tokens.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
