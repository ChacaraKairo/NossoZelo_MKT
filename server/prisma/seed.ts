import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPlanos() {
  await prisma.planos.upsert({
    where: { id: 1 },
    update: { ativo: true, valor: 49.9, ordem: 1 },
    create: {
      id: 1,
      nome: 'Plano Essencial',
      descricao: 'Plano mensal para prestadores aparecerem na busca.',
      valor: 49.9,
      beneficios: 'Perfil ativo; recebimento de pedidos; visibilidade local',
      ativo: true,
      ordem: 1,
    },
  });

  await prisma.planos.upsert({
    where: { id: 2 },
    update: { ativo: true, valor: 89.9, ordem: 2 },
    create: {
      id: 2,
      nome: 'Plano Profissional',
      descricao: 'Plano mensal com maior exposicao para prestadores.',
      valor: 89.9,
      beneficios: 'Maior visibilidade; destaque no perfil; suporte prioritario',
      ativo: true,
      ordem: 2,
    },
  });
}

async function seedMetodosPagamento() {
  const metodos = ['Pix', 'Cartao de credito', 'Boleto'];

  for (let index = 0; index < metodos.length; index += 1) {
    await prisma.metodos_pagamento.upsert({
      where: { id: index + 1 },
      update: { nome: metodos[index] },
      create: { id: index + 1, nome: metodos[index] },
    });
  }
}

async function seedAdminOpcional() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const senha = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !senha) return;

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuarios.upsert({
    where: { email },
    update: {
      senha: senhaHash,
      tipo: 'admin',
      email_confirmado: true,
      status_cadastro: 'ativo',
    },
    create: {
      id: nanoid(20),
      nome: process.env.SEED_ADMIN_NAME || 'Administrador NossoZelo',
      email,
      senha: senhaHash,
      cpf: process.env.SEED_ADMIN_CPF || `999${Date.now().toString().slice(-8)}`,
      telefone: process.env.SEED_ADMIN_PHONE || null,
      cep: process.env.SEED_ADMIN_CEP || '00000000',
      tipo: 'admin',
      email_confirmado: true,
      status_cadastro: 'ativo',
    },
  });

  await prisma.admins.upsert({
    where: { usuario_id: usuario.id },
    update: { permissao_total: true },
    create: {
      usuario_id: usuario.id,
      cargo: 'Administrador do sistema',
      permissao_total: true,
    },
  });
}

async function main() {
  await seedPlanos();
  await seedMetodosPagamento();
  await seedAdminOpcional();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
