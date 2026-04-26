import 'dotenv/config';
import { hash } from 'bcrypt';
import {
  agenda_status,
  agenda_tipo_prestador,
  contratacoes_status,
  contratacoes_tipo_prestador,
  Prisma,
  servicos_tipo_cobranca,
  servicos_tipo_prestador,
  usuarios_sexo,
  usuarios_tipo,
} from '@prisma/client';
import prisma from '../lib/prisma';

type TipoProfissional = Exclude<
  usuarios_tipo,
  'cliente' | 'admin'
>;

type UsuarioSeed = {
  id: string;
  indice: number;
  nome: string;
  tipo: usuarios_tipo;
  sexo: usuarios_sexo;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
};

const SENHA_PADRAO = '123456';
const TOTAL_USUARIOS = 50;

const cidades = [
  {
    cidade: 'Indaiatuba',
    estado: 'SP',
    bairros: ['Centro', 'Jardim Morada do Sol', 'Cidade Nova', 'Itaici'],
    lat: -23.0908,
    lon: -47.2181,
  },
  {
    cidade: 'Campinas',
    estado: 'SP',
    bairros: ['Cambuí', 'Taquaral', 'Barão Geraldo', 'Sousas'],
    lat: -22.9056,
    lon: -47.0608,
  },
  {
    cidade: 'Valinhos',
    estado: 'SP',
    bairros: ['Vila Santana', 'Centro', 'Jardim Paiquerê'],
    lat: -22.9706,
    lon: -46.9958,
  },
  {
    cidade: 'Salto',
    estado: 'SP',
    bairros: ['Centro', 'Jardim Nair Maria', 'São Judas Tadeu'],
    lat: -23.2008,
    lon: -47.2869,
  },
  {
    cidade: 'São Paulo',
    estado: 'SP',
    bairros: ['Vila Mariana', 'Pinheiros', 'Mooca', 'Santana'],
    lat: -23.5505,
    lon: -46.6333,
  },
];

const nomesFemininos = [
  'Mariana Alves',
  'Camila Ferreira',
  'Juliana Martins',
  'Renata Oliveira',
  'Fernanda Lima',
  'Patricia Souza',
  'Ana Paula Ribeiro',
  'Leticia Carvalho',
  'Beatriz Castro',
  'Simone Duarte',
  'Carolina Mendes',
  'Aline Barbosa',
  'Luiza Rocha',
  'Tatiane Moreira',
  'Daniela Nogueira',
  'Priscila Gomes',
  'Helena Araújo',
  'Vanessa Teixeira',
  'Bruna Cardoso',
  'Sabrina Farias',
  'Monica Vieira',
  'Isabela Torres',
  'Claudia Batista',
  'Larissa Monteiro',
  'Raquel Freitas',
];

const nomesMasculinos = [
  'Rafael Pereira',
  'Gustavo Almeida',
  'Felipe Santos',
  'Rodrigo Costa',
  'Lucas Andrade',
  'Marcelo Azevedo',
  'Thiago Correia',
  'Bruno Henrique',
  'Eduardo Moraes',
  'Diego Cunha',
  'Paulo Cesar',
  'André Lopes',
  'Vinicius Ramos',
  'Leonardo Matos',
  'Carlos Eduardo',
  'Henrique Pires',
  'João Victor',
  'Murilo Fernandes',
  'Alexandre Dias',
  'Leandro Tavares',
  'Roberto Campos',
  'Fabio Nascimento',
  'Igor Machado',
  'Caio Rezende',
  'Samuel Borges',
];

const especialidadesPorTipo: Record<TipoProfissional, string[]> = {
  cuidador: [
    'cuidados com idosos',
    'apoio em higiene e alimentação',
    'acompanhamento domiciliar',
    'rotina de medicação',
  ],
  enfermeiro: [
    'curativos',
    'administração de medicamentos',
    'pós-operatório',
    'aferição de sinais vitais',
  ],
  acompanhante: [
    'companhia para consultas',
    'passeios assistidos',
    'apoio em compras',
    'acompanhamento hospitalar',
  ],
};

const servicosPorTipo: Record<
  TipoProfissional,
  { nome: string; descricao: string; valor: number; cobranca: servicos_tipo_cobranca }[]
> = {
  cuidador: [
    {
      nome: 'Cuidado domiciliar por hora',
      descricao:
        'Atendimento humanizado em casa, com apoio na rotina, higiene e alimentação.',
      valor: 85,
      cobranca: 'hora',
    },
    {
      nome: 'Diária de cuidado assistido',
      descricao:
        'Acompanhamento prolongado para idosos ou pessoas em recuperação.',
      valor: 320,
      cobranca: 'dia',
    },
  ],
  enfermeiro: [
    {
      nome: 'Atendimento de enfermagem',
      descricao:
        'Procedimentos de enfermagem, curativos, sinais vitais e orientação de cuidados.',
      valor: 140,
      cobranca: 'hora',
    },
    {
      nome: 'Plantão de enfermagem',
      descricao:
        'Plantão domiciliar para cuidados técnicos e acompanhamento clínico.',
      valor: 520,
      cobranca: 'dia',
    },
  ],
  acompanhante: [
    {
      nome: 'Acompanhamento em consultas',
      descricao:
        'Apoio em deslocamento, espera e retorno de consultas ou exames.',
      valor: 70,
      cobranca: 'hora',
    },
    {
      nome: 'Companhia diária assistida',
      descricao:
        'Presença acolhedora durante o dia para segurança, conversa e pequenas rotinas.',
      valor: 260,
      cobranca: 'dia',
    },
  ],
};

function tipoPorIndice(indice: number): usuarios_tipo {
  if (indice <= 20) return 'cliente';
  if (indice <= 30) return 'cuidador';
  if (indice <= 40) return 'enfermeiro';
  return 'acompanhante';
}

function cpfValidoSequencial(indice: number) {
  const noveDigitos = String(100000000 + indice).padStart(9, '0');
  const numeros = noveDigitos.split('').map(Number);

  const primeiroResto =
    numeros.reduce((soma, numero, posicao) => soma + numero * (10 - posicao), 0) %
    11;
  const primeiroDigito = primeiroResto < 2 ? 0 : 11 - primeiroResto;
  const comPrimeiro = [...numeros, primeiroDigito];
  const segundoResto =
    comPrimeiro.reduce(
      (soma, numero, posicao) => soma + numero * (11 - posicao),
      0,
    ) % 11;
  const segundoDigito = segundoResto < 2 ? 0 : 11 - segundoResto;
  const cpf = [...comPrimeiro, segundoDigito].join('');

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function deslocamento(indice: number, fator: number) {
  return Number(((indice % 7) * fator - fator * 3).toFixed(6));
}

function criarUsuariosSeed(): UsuarioSeed[] {
  return Array.from({ length: TOTAL_USUARIOS }, (_, posicao) => {
    const indice = posicao + 1;
    const tipo = tipoPorIndice(indice);
    const masculino = indice % 3 === 0;
    const nome = masculino
      ? nomesMasculinos[posicao % nomesMasculinos.length]
      : nomesFemininos[posicao % nomesFemininos.length];
    const local = cidades[posicao % cidades.length];
    const bairro = local.bairros[posicao % local.bairros.length];

    return {
      id: `seed-u-${String(indice).padStart(3, '0')}`,
      indice,
      nome,
      tipo,
      sexo: masculino ? 'masculino' : 'feminino',
      cpf: cpfValidoSequencial(indice),
      telefone: `(19) 9${String(80000000 + indice * 137).slice(-8)}`,
      data_nascimento: `${1970 + (indice % 28)}-${String(
        (indice % 12) + 1,
      ).padStart(2, '0')}-${String((indice % 27) + 1).padStart(2, '0')}`,
      cep: `${String(13000000 + indice * 19).replace(
        /(\d{5})(\d{3})/,
        '$1-$2',
      )}`,
      endereco: `Rua ${['das Acácias', 'dos Ipês', 'Boa Vista', 'Esperança', 'São José'][posicao % 5]}, ${120 + indice}`,
      bairro,
      cidade: local.cidade,
      estado: local.estado,
      latitude: Number((local.lat + deslocamento(indice, 0.006)).toFixed(6)),
      longitude: Number((local.lon + deslocamento(indice, 0.007)).toFixed(6)),
    };
  });
}

function horaUtc(hora: number) {
  return new Date(Date.UTC(1970, 0, 1, hora, 0, 0));
}

function dataDia(dia: number) {
  return new Date(Date.UTC(2026, 4, dia, 0, 0, 0));
}

async function upsertPerfilProfissional(usuario: UsuarioSeed) {
  if (usuario.tipo === 'cliente' || usuario.tipo === 'admin') return;

  const tipo = usuario.tipo as TipoProfissional;
  const anos = 2 + (usuario.indice % 12);
  const valorHora = new Prisma.Decimal(
    servicosPorTipo[tipo][0].valor + (usuario.indice % 5) * 10,
  );
  const valorDiaria = new Prisma.Decimal(
    servicosPorTipo[tipo][1].valor + (usuario.indice % 4) * 35,
  );
  const especialidades = especialidadesPorTipo[tipo].join(', ');
  const bio = `${usuario.nome} atua em ${usuario.cidade} com atendimento acolhedor, pontual e focado na segurança da família. Experiência em ${especialidades}.`;

  if (tipo === 'cuidador') {
    await prisma.cuidadores.upsert({
      where: { usuario_id: usuario.id },
      update: {
        bio,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Segunda a sábado, manhã e tarde',
        especialidades,
        avaliacao_media: new Prisma.Decimal('4.70'),
      },
      create: {
        usuario_id: usuario.id,
        bio,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Segunda a sábado, manhã e tarde',
        especialidades,
        avaliacao_media: new Prisma.Decimal('4.70'),
        documento_profissional: `DOC-CUID-${usuario.indice}`,
      },
    });
  }

  if (tipo === 'enfermeiro') {
    await prisma.enfermeiros.upsert({
      where: { usuario_id: usuario.id },
      update: {
        coren: `COREN-SP-${String(90000 + usuario.indice)}`,
        bio,
        especialidade: 'Atendimento domiciliar',
        especialidades,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Dias úteis, plantões combinados',
        avaliacao_media: new Prisma.Decimal('4.80'),
      },
      create: {
        usuario_id: usuario.id,
        coren: `COREN-SP-${String(90000 + usuario.indice)}`,
        bio,
        especialidade: 'Atendimento domiciliar',
        especialidades,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Dias úteis, plantões combinados',
        avaliacao_media: new Prisma.Decimal('4.80'),
      },
    });
  }

  if (tipo === 'acompanhante') {
    await prisma.acompanhantes.upsert({
      where: { usuario_id: usuario.id },
      update: {
        bio,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Todos os dias, horários flexíveis',
        especialidades,
        avaliacao_media: new Prisma.Decimal('4.60'),
      },
      create: {
        usuario_id: usuario.id,
        bio,
        anos_experiencia: anos,
        valor_hora: valorHora,
        valor_diaria: valorDiaria,
        disponibilidade: 'Todos os dias, horários flexíveis',
        especialidades,
        avaliacao_media: new Prisma.Decimal('4.60'),
      },
    });
  }
}

async function upsertServicosEAgenda(usuario: UsuarioSeed) {
  if (usuario.tipo === 'cliente' || usuario.tipo === 'admin') return;

  const tipo = usuario.tipo as TipoProfissional;
  const servicos = servicosPorTipo[tipo];

  for (const [index, servico] of servicos.entries()) {
    const nome = `${servico.nome} - ${usuario.nome.split(' ')[0]}`;
    const existente = await prisma.servicos.findFirst({
      where: {
        prestador_id: usuario.id,
        nome,
      },
      select: { id: true },
    });

    if (existente) {
      await prisma.servicos.update({
        where: { id: existente.id },
        data: {
          descricao: servico.descricao,
          valor: new Prisma.Decimal(servico.valor + (usuario.indice % 6) * 8),
          tipo_cobranca: servico.cobranca,
        },
      });
      continue;
    }

    await prisma.servicos.create({
      data: {
        prestador_id: usuario.id,
        tipo_prestador: tipo as servicos_tipo_prestador,
        nome,
        descricao: servico.descricao,
        valor: new Prisma.Decimal(servico.valor + (usuario.indice % 6) * 8),
        tipo_cobranca: servico.cobranca,
      },
    });

    await prisma.agenda.create({
      data: {
        prestador_id: usuario.id,
        tipo_prestador: tipo as agenda_tipo_prestador,
        data: dataDia(10 + ((usuario.indice + index) % 14)),
        hora_inicio: horaUtc(8 + index * 3),
        hora_fim: horaUtc(10 + index * 3),
        observacoes:
          index === 0
            ? 'Janela disponível para novos atendimentos.'
            : 'Horário reservado para atendimentos previamente alinhados.',
        status: index === 0 ? agenda_status.disponivel : agenda_status.ocupado,
      },
    });
  }
}

async function upsertUsuario(usuario: UsuarioSeed, senhaHash: string) {
  await prisma.usuarios.upsert({
    where: { email: `exemplo${usuario.indice}@gmail.com` },
    update: {
      nome: usuario.nome,
      senha: senhaHash,
      telefone: usuario.telefone,
      sexo: usuario.sexo,
      data_nascimento: new Date(`${usuario.data_nascimento}T00:00:00Z`),
      cep: usuario.cep,
      endereco: usuario.endereco,
      bairro: usuario.bairro,
      cidade: usuario.cidade,
      estado: usuario.estado,
      pais: 'Brasil',
      tipo: usuario.tipo,
      email_confirmado: true,
      avaliacao_media:
        usuario.tipo === 'cliente'
          ? new Prisma.Decimal('0.00')
          : new Prisma.Decimal('4.70'),
    },
    create: {
      id: usuario.id,
      nome: usuario.nome,
      email: `exemplo${usuario.indice}@gmail.com`,
      senha: senhaHash,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      sexo: usuario.sexo,
      data_nascimento: new Date(`${usuario.data_nascimento}T00:00:00Z`),
      cep: usuario.cep,
      endereco: usuario.endereco,
      bairro: usuario.bairro,
      cidade: usuario.cidade,
      estado: usuario.estado,
      pais: 'Brasil',
      tipo: usuario.tipo,
      email_confirmado: true,
      avaliacao_media:
        usuario.tipo === 'cliente'
          ? new Prisma.Decimal('0.00')
          : new Prisma.Decimal('4.70'),
    },
  });

  await prisma.localizacoes.upsert({
    where: { usuario_id: usuario.id },
    update: {
      latitude: new Prisma.Decimal(usuario.latitude),
      longitude: new Prisma.Decimal(usuario.longitude),
    },
    create: {
      usuario_id: usuario.id,
      latitude: new Prisma.Decimal(usuario.latitude),
      longitude: new Prisma.Decimal(usuario.longitude),
    },
  });
}

async function criarContratacoesEAvaliacoes(usuarios: UsuarioSeed[]) {
  const clientes = usuarios.filter((usuario) => usuario.tipo === 'cliente');
  const prestadores = usuarios.filter(
    (usuario) => usuario.tipo !== 'cliente' && usuario.tipo !== 'admin',
  );
  const status: contratacoes_status[] = [
    'pendente',
    'confirmado',
    'concluido',
    'cancelado',
  ];

  for (let index = 0; index < 16; index += 1) {
    const cliente = clientes[index % clientes.length];
    const prestador = prestadores[index % prestadores.length];
    const servico = await prisma.servicos.findFirst({
      where: { prestador_id: prestador.id },
      orderBy: { id: 'asc' },
    });

    if (!servico) continue;

    const observacoes = `Seed teste ${index + 1}: atendimento solicitado por ${cliente.nome}.`;
    const existente = await prisma.contratacoes.findFirst({
      where: {
        cliente_id: cliente.id,
        prestador_id: prestador.id,
        observacoes,
      },
      select: { id: true, status: true },
    });

    const dadosContratacao = {
      cliente_id: cliente.id,
      prestador_id: prestador.id,
      tipo_prestador: prestador.tipo as contratacoes_tipo_prestador,
      data: dataDia(5 + index),
      hora_inicio: horaUtc(9 + (index % 4)),
      hora_fim: horaUtc(10 + (index % 4)),
      preco: servico.valor,
      status: status[index % status.length],
      observacoes,
    };

    const contratacao = existente
      ? await prisma.contratacoes.update({
          where: { id: existente.id },
          data: dadosContratacao,
        })
      : await prisma.contratacoes.create({
          data: dadosContratacao,
        });

    if (contratacao.status === 'concluido') {
      await prisma.avaliacoes.upsert({
        where: { contratacao_id: contratacao.id },
        update: {
          nota: 4 + (index % 2),
          comentario:
            index % 2 === 0
              ? 'Atendimento pontual e muito cuidadoso.'
              : 'Profissional atencioso, recomendo para outras famílias.',
        },
        create: {
          contratacao_id: contratacao.id,
          cliente_id: cliente.id,
          prestador_id: prestador.id,
          tipo_prestador: prestador.tipo as any,
          nota: 4 + (index % 2),
          comentario:
            index % 2 === 0
              ? 'Atendimento pontual e muito cuidadoso.'
              : 'Profissional atencioso, recomendo para outras famílias.',
        },
      });
    }
  }
}

async function main() {
  console.log('[SEED] Criando usuarios de teste Nosso Zelo...');
  const senhaHash = await hash(SENHA_PADRAO, 10);
  const usuarios = criarUsuariosSeed();

  for (const usuario of usuarios) {
    await upsertUsuario(usuario, senhaHash);
    await upsertPerfilProfissional(usuario);
    await upsertServicosEAgenda(usuario);

    console.log(
      `[SEED] ${String(usuario.indice).padStart(2, '0')}/50 ${usuario.tipo}: exemplo${usuario.indice}@gmail.com`,
    );
  }

  await criarContratacoesEAvaliacoes(usuarios);

  console.log('[SEED] Finalizado com sucesso.');
  console.log('[SEED] Emails: exemplo1@gmail.com ate exemplo50@gmail.com');
  console.log('[SEED] Senha para todos: 123456');
}

main()
  .catch((error) => {
    console.error('[SEED] Falha ao criar dados de teste:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
