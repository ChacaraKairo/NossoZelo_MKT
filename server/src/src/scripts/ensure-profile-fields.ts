import prisma from '../lib/prisma';
import logger from '../lib/logger';

type ColunaPerfil = {
  tabela: string;
  coluna: string;
  definicao: string;
  depoisDe: string;
};

const COLUNAS_PERFIL: ColunaPerfil[] = [
  {
    tabela: 'usuarios',
    coluna: 'bairro',
    definicao: 'VARCHAR(100) NULL',
    depoisDe: 'endereco',
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
];

async function colunaExiste(tabela: string, coluna: string) {
  const resultado = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*) AS total
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ${tabela}
      AND COLUMN_NAME = ${coluna}
  `;

  return Number(resultado[0]?.total || 0) > 0;
}

async function garantirColuna({
  tabela,
  coluna,
  definicao,
  depoisDe,
}: ColunaPerfil) {
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
    `ALTER TABLE \`${tabela}\` ADD COLUMN \`${coluna}\` ${definicao} AFTER \`${depoisDe}\``,
  );
}

async function executar() {
  logger.info('EnsureProfileFields: verificando colunas de perfil');

  for (const coluna of COLUNAS_PERFIL) {
    await garantirColuna(coluna);
  }

  logger.info('EnsureProfileFields: verificacao concluida');
}

executar()
  .catch((error) => {
    logger.error('EnsureProfileFields: falha ao preparar schema', {
      erro: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
