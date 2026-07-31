import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { PrismaClient, usuarios_tipo } from '@prisma/client';

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

type PrestadorDemo = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipo: Extract<usuarios_tipo, 'baba' | 'diarista' | 'motorista_assistencial'>;
  tabela: 'babas' | 'diaristas' | 'motoristas_assistenciais';
  cidade: string;
  estado: string;
  bairro: string;
  endereco: string;
  latitude: number;
  longitude: number;
  bio: string;
  anos_experiencia: number;
  valor_hora: number;
  valor_diaria: number;
  disponibilidade: string;
  especialidades: string;
  placa?: string;
  servicoNome: string;
  servicoDescricao: string;
  servicoValor: number;
};

const PRESTADORES_DEMO: PrestadorDemo[] = [
  {
    id: 'demo-baba-zelo',
    nome: 'Marina Souza',
    email: 'baba.demo@nossozelo.local',
    cpf: '90000000001',
    telefone: '11970000001',
    tipo: 'baba',
    tabela: 'babas',
    cidade: 'Sao Paulo',
    estado: 'SP',
    bairro: 'Vila Mariana',
    endereco: 'Rua Domingos de Morais, 1000',
    latitude: -23.5893,
    longitude: -46.6341,
    bio: 'Baba com experiencia em rotina infantil, atividades educativas e apoio familiar.',
    anos_experiencia: 5,
    valor_hora: 65,
    valor_diaria: 320,
    disponibilidade: 'Segunda a sexta, periodo da tarde',
    especialidades: 'Rotina infantil, atividades educativas, acompanhamento escolar',
    servicoNome: 'Cuidado infantil domiciliar',
    servicoDescricao: 'Apoio seguro para rotina, brincadeiras e acompanhamento infantil.',
    servicoValor: 65,
  },
  {
    id: 'demo-diarista-zelo',
    nome: 'Patricia Lima',
    email: 'diarista.demo@nossozelo.local',
    cpf: '90000000002',
    telefone: '11970000002',
    tipo: 'diarista',
    tabela: 'diaristas',
    cidade: 'Sao Paulo',
    estado: 'SP',
    bairro: 'Pinheiros',
    endereco: 'Rua dos Pinheiros, 500',
    latitude: -23.5664,
    longitude: -46.6864,
    bio: 'Diarista com foco em limpeza residencial, organizacao e cuidado com detalhes.',
    anos_experiencia: 7,
    valor_hora: 55,
    valor_diaria: 280,
    disponibilidade: 'Tercas, quintas e sabados',
    especialidades: 'Faxina residencial, organizacao, limpeza pos-obra leve',
    servicoNome: 'Faxina residencial completa',
    servicoDescricao: 'Limpeza e organizacao de ambientes residenciais.',
    servicoValor: 280,
  },
  {
    id: 'demo-motorista-zelo',
    nome: 'Roberto Almeida',
    email: 'motorista.demo@nossozelo.local',
    cpf: '90000000003',
    telefone: '11970000003',
    tipo: 'motorista_assistencial',
    tabela: 'motoristas_assistenciais',
    cidade: 'Sao Paulo',
    estado: 'SP',
    bairro: 'Moema',
    endereco: 'Avenida Ibirapuera, 1500',
    latitude: -23.6085,
    longitude: -46.6674,
    bio: 'Motorista assistencial para idosos em consultas, exames e compromissos.',
    anos_experiencia: 9,
    valor_hora: 90,
    valor_diaria: 420,
    disponibilidade: 'Dias uteis, das 7h as 18h',
    especialidades: 'Transporte de idosos, consultas medicas, acompanhamento porta a porta',
    placa: 'ABC1D23',
    servicoNome: 'Transporte assistencial',
    servicoDescricao: 'Deslocamento acompanhado para idosos com suporte porta a porta.',
    servicoValor: 90,
  },
];

async function seedClienteDemo() {
  const senhaHash = await bcrypt.hash(
    process.env.SEED_DEMO_PASSWORD || 'Demo@12345',
    10,
  );
  const agora = new Date();
  const clienteId = 'demo-cliente-zelo';

  await prisma.usuarios.upsert({
    where: { email: 'cliente.demo@nossozelo.local' },
    update: {
      nome: 'Cliente Demo NossoZelo',
      senha: senhaHash,
      telefone: '11970000004',
      tipo: 'cliente',
      status_cadastro: 'ativo',
      email_confirmado: true,
      endereco: 'Avenida Paulista, 1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
      estado: 'SP',
    },
    create: {
      id: clienteId,
      nome: 'Cliente Demo NossoZelo',
      email: 'cliente.demo@nossozelo.local',
      senha: senhaHash,
      cpf: '90000000004',
      telefone: '11970000004',
      cep: '01310100',
      endereco: 'Avenida Paulista, 1000',
      bairro: 'Bela Vista',
      cidade: 'Sao Paulo',
      estado: 'SP',
      pais: 'Brasil',
      tipo: 'cliente',
      status_cadastro: 'ativo',
      email_confirmado: true,
      termos_aceitos_em: agora,
      privacidade_aceita_em: agora,
    },
  });

  await prisma.localizacoes.upsert({
    where: { usuario_id: clienteId },
    update: {
      latitude: -23.565,
      longitude: -46.651,
    },
    create: {
      usuario_id: clienteId,
      latitude: -23.565,
      longitude: -46.651,
    },
  });
}

async function seedPrestadoresDemo() {
  const senhaHash = await bcrypt.hash(
    process.env.SEED_DEMO_PASSWORD || 'Demo@12345',
    10,
  );
  const agora = new Date();

  for (const prestador of PRESTADORES_DEMO) {
    await prisma.usuarios.upsert({
      where: { email: prestador.email },
      update: {
        nome: prestador.nome,
        senha: senhaHash,
        telefone: prestador.telefone,
        tipo: prestador.tipo,
        status_cadastro: 'ativo',
        email_confirmado: true,
        cidade: prestador.cidade,
        estado: prestador.estado,
        bairro: prestador.bairro,
        endereco: prestador.endereco,
      },
      create: {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email,
        senha: senhaHash,
        cpf: prestador.cpf,
        telefone: prestador.telefone,
        cep: '01001000',
        endereco: prestador.endereco,
        bairro: prestador.bairro,
        cidade: prestador.cidade,
        estado: prestador.estado,
        pais: 'Brasil',
        tipo: prestador.tipo,
        status_cadastro: 'ativo',
        email_confirmado: true,
        termos_aceitos_em: agora,
        privacidade_aceita_em: agora,
      },
    });

    await (prisma as any)[prestador.tabela].upsert({
      where: { usuario_id: prestador.id },
      update: {
        bio: prestador.bio,
        anos_experiencia: prestador.anos_experiencia,
        valor_hora: prestador.valor_hora,
        valor_diaria: prestador.valor_diaria,
        disponibilidade: prestador.disponibilidade,
        especialidades: prestador.especialidades,
        ...(prestador.placa ? { placa: prestador.placa } : {}),
      },
      create: {
        usuario_id: prestador.id,
        bio: prestador.bio,
        anos_experiencia: prestador.anos_experiencia,
        valor_hora: prestador.valor_hora,
        valor_diaria: prestador.valor_diaria,
        disponibilidade: prestador.disponibilidade,
        especialidades: prestador.especialidades,
        ...(prestador.placa ? { placa: prestador.placa } : {}),
      },
    });

    await prisma.localizacoes.upsert({
      where: { usuario_id: prestador.id },
      update: {
        latitude: prestador.latitude,
        longitude: prestador.longitude,
      },
      create: {
        usuario_id: prestador.id,
        latitude: prestador.latitude,
        longitude: prestador.longitude,
      },
    });

    await prisma.assinaturas.upsert({
      where: { id: 1000 + PRESTADORES_DEMO.indexOf(prestador) },
      update: {
        status: 'ativa',
        plano_id: 1,
        data_fim: new Date('2027-12-31T23:59:59.000Z'),
      },
      create: {
        id: 1000 + PRESTADORES_DEMO.indexOf(prestador),
        prestador_id: prestador.id,
        plano_id: 1,
        status: 'ativa',
        gateway: 'seed',
        gateway_customer_id: `seed_${prestador.id}`,
        gateway_subscription_id: `seed_sub_${prestador.id}`,
        data_fim: new Date('2027-12-31T23:59:59.000Z'),
      },
    });

    const servicoExistente = await prisma.servicos.findFirst({
      where: {
        prestador_id: prestador.id,
        nome: prestador.servicoNome,
      },
    });

    if (servicoExistente) {
      await prisma.servicos.update({
        where: { id: servicoExistente.id },
        data: {
          tipo_prestador: prestador.tipo,
          descricao: prestador.servicoDescricao,
          valor: prestador.servicoValor,
          tipo_cobranca: prestador.tipo === 'diarista' ? 'dia' : 'hora',
        },
      });
    } else {
      await prisma.servicos.create({
        data: {
          prestador_id: prestador.id,
          tipo_prestador: prestador.tipo,
          nome: prestador.servicoNome,
          descricao: prestador.servicoDescricao,
          valor: prestador.servicoValor,
          tipo_cobranca: prestador.tipo === 'diarista' ? 'dia' : 'hora',
        },
      });
    }
  }
}

async function main() {
  await seedPlanos();
  await seedMetodosPagamento();
  await seedAdminOpcional();
  await seedClienteDemo();
  await seedPrestadoresDemo();
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
