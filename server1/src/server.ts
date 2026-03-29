import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import app from './main';

dotenv.config();

const prisma = new PrismaClient();
const PORT = process.env.PORT || '4000';
const link = process.env.LINK || 'http://localhost';

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log(
      '✅ Conexão com o banco de dados estabelecida',
    );
  } catch (error) {
    console.error(
      '❌ Falha ao conectar ao banco de dados:',
      error,
    );
    process.exit(1);
  }
}

app.listen(parseInt(PORT), async () => {
  await testDatabaseConnection();
  console.log(`🚀 Servidor rodando em ${link}${PORT}`);
});
