/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Ponto de entrada (Bootstrap) da aplicação, responsável por validar a
 * conectividade com a infraestrutura de dados e iniciar o escopo do servidor Express.
 * @rota server\src\server
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import app from './main';

console.log(
  '[LOG-FLUXO] Iniciando o bootstrap da aplicação e carregando variáveis de ambiente via dotenv.',
);
dotenv.config();

console.log(
  '[LOG-FLUXO] Inicializando o PrismaClient para gerenciamento centralizado de conexões com o banco de dados.',
);
const prisma = new PrismaClient();

const PORT = process.env.PORT || '4000';
const link = process.env.LINK || 'http://localhost';

/**
 * Função responsável por validar a conectividade com o banco de dados antes do servidor aceitar requisições.
 * Realiza o handshake inicial para garantir que a infraestrutura está disponível.
 * @returns {Promise<void>}
 * @throws {Error} - Em caso de falha crítica na conexão, o processo é encerrado.
 */
async function testDatabaseConnection() {
  console.log(
    '[LOG-FLUXO] Iniciando execução de testDatabaseConnection para validar conectividade com o banco.',
  );

  try {
    console.log(
      '[LOG-FLUXO] Tentando estabelecer handshake via Prisma ($connect)...',
    );

    // Operação assíncrona: Conexão física com o banco
    await prisma.$connect();

    console.log(
      '[LOG-FLUXO] ✅ Sucesso: Conexão com o banco de dados validada e estabelecida.',
    );
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Falha crítica de infraestrutura: Não foi possível conectar ao banco de dados. Motivo: ${
        error.message || error
      }`,
    );

    console.log(
      '[LOG-FLUXO] Encerrando processo da aplicação (exit 1) devido ao estado inconsistente de dependências.',
    );
    // Encerra o processo para evitar que a aplicação rode em estado inconsistente
    process.exit(1);
  }
}

console.log(
  `[LOG-FLUXO] Configurando listener do Express na porta: ${PORT}`,
);

/**
 * Inicia o servidor HTTP e executa as rotinas de verificação pós-startup.
 */
app.listen(parseInt(PORT), async () => {
  console.log(
    `[LOG-FLUXO] Servidor Express disparado com sucesso. Iniciando validações de dependências (Porta: ${PORT}).`,
  );

  console.log(
    '[LOG-FLUXO] Disparando verificação de saúde do banco de dados no startup.',
  );

  // Chamada de validação essencial
  await testDatabaseConnection();

  console.log(
    `[LOG-FLUXO] Bootstrap finalizado com êxito total. 🚀 Servidor operacional em ${link}:${PORT}`,
  );
});
