/// <reference types="node" />
import 'dotenv/config';

// Exportamos o objeto diretamente e usamos "as any" para contornar a falha de tipagem do TS
export default {
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
} as any;
