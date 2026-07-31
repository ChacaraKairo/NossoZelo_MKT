import prisma from '../lib/prisma';
import logger from '../lib/logger';

type ColunaSchema = {
  tabela: string;
  coluna: string;
  definicao: string;
  depoisDe: string;
};

const COLUNAS_SCHEMA: ColunaSchema[] = [
  {
    tabela: 'usuarios',
    coluna: 'bairro',
    definicao: 'VARCHAR(100) NULL',
    depoisDe: 'endereco',
  },
  {
    tabela: 'usuarios',
    coluna: 'status_cadastro',
    definicao:
      "ENUM('ativo', 'pendente_pagamento', 'aguardando_confirmacao_pagamento', 'inadimplente', 'bloqueado', 'cancelado') NOT NULL DEFAULT 'ativo'",
    depoisDe: 'tipo',
  },
  {
    tabela: 'cuidadores',
    coluna: 'valor_hora',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'anos_experiencia',
  },
  {
    tabela: 'cuidadores',
    coluna: 'valor_diaria',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'valor_hora',
  },
  {
    tabela: 'cuidadores',
    coluna: 'disponibilidade',
    definicao: 'VARCHAR(255) NULL',
    depoisDe: 'valor_diaria',
  },
  {
    tabela: 'cuidadores',
    coluna: 'especialidades',
    definicao: 'TEXT NULL',
    depoisDe: 'disponibilidade',
  },
  {
    tabela: 'enfermeiros',
    coluna: 'especialidades',
    definicao: 'TEXT NULL',
    depoisDe: 'especialidade',
  },
  {
    tabela: 'enfermeiros',
    coluna: 'valor_hora',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'anos_experiencia',
  },
  {
    tabela: 'enfermeiros',
    coluna: 'valor_diaria',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'valor_hora',
  },
  {
    tabela: 'enfermeiros',
    coluna: 'disponibilidade',
    definicao: 'VARCHAR(255) NULL',
    depoisDe: 'valor_diaria',
  },
  {
    tabela: 'acompanhantes',
    coluna: 'valor_hora',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'anos_experiencia',
  },
  {
    tabela: 'acompanhantes',
    coluna: 'valor_diaria',
    definicao: 'DECIMAL(10, 2) NULL',
    depoisDe: 'valor_hora',
  },
  {
    tabela: 'acompanhantes',
    coluna: 'disponibilidade',
    definicao: 'VARCHAR(255) NULL',
    depoisDe: 'valor_diaria',
  },
  {
    tabela: 'acompanhantes',
    coluna: 'especialidades',
    definicao: 'TEXT NULL',
    depoisDe: 'disponibilidade',
  },
  {
    tabela: 'assinaturas',
    coluna: 'prestador_id',
    definicao: 'VARCHAR(20) NULL',
    depoisDe: 'id',
  },
  {
    tabela: 'assinaturas',
    coluna: 'status',
    definicao:
      "ENUM('pendente', 'aguardando_confirmacao', 'ativa', 'atrasada', 'bloqueada', 'cancelada', 'falhou', 'expirada') NOT NULL DEFAULT 'pendente'",
    depoisDe: 'data_fim',
  },
  {
    tabela: 'assinaturas',
    coluna: 'gateway',
    definicao: "VARCHAR(30) NOT NULL DEFAULT 'asaas'",
    depoisDe: 'status',
  },
  {
    tabela: 'assinaturas',
    coluna: 'gateway_customer_id',
    definicao: 'VARCHAR(120) NULL',
    depoisDe: 'gateway',
  },
  {
    tabela: 'assinaturas',
    coluna: 'gateway_subscription_id',
    definicao: 'VARCHAR(120) NULL',
    depoisDe: 'gateway_customer_id',
  },
  {
    tabela: 'assinaturas',
    coluna: 'gateway_status',
    definicao: 'VARCHAR(60) NULL',
    depoisDe: 'gateway_subscription_id',
  },
  {
    tabela: 'assinaturas',
    coluna: 'data_ultimo_pagamento',
    definicao: 'TIMESTAMP(0) NULL',
    depoisDe: 'gateway_status',
  },
  {
    tabela: 'assinaturas',
    coluna: 'data_proximo_vencimento',
    definicao: 'TIMESTAMP(0) NULL',
    depoisDe: 'data_ultimo_pagamento',
  },
  {
    tabela: 'assinaturas',
    coluna: 'periodo_tolerancia_ate',
    definicao: 'TIMESTAMP(0) NULL',
    depoisDe: 'data_proximo_vencimento',
  },
  {
    tabela: 'assinaturas',
    coluna: 'confirmacao_expira_em',
    definicao: 'TIMESTAMP(0) NULL',
    depoisDe: 'periodo_tolerancia_ate',
  },
  {
    tabela: 'assinaturas',
    coluna: 'cancelada_em',
    definicao: 'TIMESTAMP(0) NULL',
    depoisDe: 'confirmacao_expira_em',
  },
  {
    tabela: 'assinaturas',
    coluna: 'criado_em',
    definicao: 'TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)',
    depoisDe: 'cancelada_em',
  },
  {
    tabela: 'assinaturas',
    coluna: 'atualizado_em',
    definicao:
      'TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)',
    depoisDe: 'criado_em',
  },
];

async function colunaExiste(tabela: string, coluna: string) {
  const resultado = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*) AS total
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = ${tabela}
      AND column_name = ${coluna}
  `;

  return Number(resultado[0]?.total || 0) > 0;
}

async function tabelaExiste(tabela: string) {
  const resultado = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*) AS total
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = ${tabela}
  `;

  return Number(resultado[0]?.total || 0) > 0;
}

async function garantirTabelaConfirmacoesEmail() {
  if (await tabelaExiste('confirmacoes_email')) {
    logger.info('EnsureProfileFields: tabela ja existe', {
      tabela: 'confirmacoes_email',
    });
    return;
  }

  logger.warn('EnsureProfileFields: criando tabela ausente', {
    tabela: 'confirmacoes_email',
  });

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "confirmacoes_email" (
      "id" SERIAL NOT NULL,
      "usuario_id" VARCHAR(20) NOT NULL,
      "token" VARCHAR(255) NOT NULL,
      "expiracao" TIMESTAMP(0) NOT NULL,
      "usado" BOOLEAN NOT NULL DEFAULT false,
      "criado_em" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "confirmacoes_email_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "confirmacoes_email_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX "confirmacoes_email_token_key" ON "confirmacoes_email"("token")',
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX "confirmacoes_email_usuario_id_idx" ON "confirmacoes_email"("usuario_id")',
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX "confirmacoes_email_token_idx" ON "confirmacoes_email"("token")',
  );
}

function definicaoPostgres(coluna: ColunaSchema) {
  if (coluna.tabela === 'usuarios' && coluna.coluna === 'status_cadastro') {
    return '"usuarios_status_cadastro" NOT NULL DEFAULT \'ativo\'';
  }

  if (coluna.tabela === 'assinaturas' && coluna.coluna === 'status') {
    return '"assinaturas_status" NOT NULL DEFAULT \'pendente\'';
  }

  return coluna.definicao
    .replace('CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)', 'CURRENT_TIMESTAMP')
    .replace(/CURRENT_TIMESTAMP\(0\)/g, 'CURRENT_TIMESTAMP');
}

async function garantirColuna({
  tabela,
  coluna,
  definicao,
  depoisDe,
}: ColunaSchema) {
  if (await colunaExiste(tabela, coluna)) {
    logger.info('EnsureProfileFields: coluna ja existe', {
      tabela,
      coluna,
    });
    return;
  }

  logger.warn('EnsureProfileFields: adicionando coluna ausente', {
    tabela,
    coluna,
  });

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "${tabela}" ADD COLUMN "${coluna}" ${definicaoPostgres({
      tabela,
      coluna,
      definicao,
      depoisDe,
    })}`,
  );
}

async function garantirIndiceAssinaturaPrestadorStatus() {
  const resultado = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*) AS total
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'assinaturas'
      AND indexname = 'assinaturas_prestador_status_idx'
  `;

  if (Number(resultado[0]?.total || 0) > 0) {
    logger.info('EnsureProfileFields: indice ja existe', {
      tabela: 'assinaturas',
      indice: 'assinaturas_prestador_status_idx',
    });
    return;
  }

  logger.warn('EnsureProfileFields: adicionando indice ausente', {
    tabela: 'assinaturas',
    indice: 'assinaturas_prestador_status_idx',
  });

  await prisma.$executeRawUnsafe(
    'CREATE INDEX "assinaturas_prestador_status_idx" ON "assinaturas"("prestador_id", "status")',
  );
}

async function sincronizarStatusCadastroPrestadores() {
  if (
    (await colunaExiste('assinaturas', 'prestador_id')) &&
    (await colunaExiste('assinaturas', 'cuidador_id'))
  ) {
    await prisma.$executeRawUnsafe(`
      UPDATE "assinaturas"
      SET "prestador_id" = "cuidador_id"
      WHERE "prestador_id" IS NULL
    `);
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "usuarios" u
    SET "status_cadastro" = 'pendente_pagamento'
    WHERE u."tipo" IN ('cuidador', 'enfermeiro', 'acompanhante', 'baba', 'diarista', 'motorista_assistencial')
      AND u."status_cadastro" = 'ativo'
      AND NOT EXISTS (
        SELECT 1
        FROM "assinaturas" a
        WHERE a."prestador_id" = u."id"
          AND a."status" = 'ativa'
      )
  `);

  logger.info('EnsureProfileFields: status de prestadores sincronizado');
}

export async function ensureProfileFields() {
  logger.info('EnsureProfileFields: verificando colunas de schema');

  await garantirTabelaConfirmacoesEmail();

  for (const coluna of COLUNAS_SCHEMA) {
    await garantirColuna(coluna);
  }

  await garantirIndiceAssinaturaPrestadorStatus();
  await sincronizarStatusCadastroPrestadores();

  logger.info('EnsureProfileFields: verificacao concluida');
}

if (require.main === module) {
  ensureProfileFields()
    .catch((error) => {
      logger.error('EnsureProfileFields: falha ao preparar schema', {
        erro: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
