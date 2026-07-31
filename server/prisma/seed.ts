import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TipoDocumentoSeed = Prisma.tipos_documentosUncheckedCreateInput & {
  regras?: Array<{ codigo: string; descricao: string; severidade?: string }>;
};

const obrigatorioTodosPrestadores = {
  obrigatorio_cuidador: true,
  obrigatorio_enfermeiro: true,
  obrigatorio_acompanhante: true,
  obrigatorio_baba: true,
  obrigatorio_diarista: true,
  obrigatorio_motorista_assistencial: true,
};

const tiposDocumentos: TipoDocumentoSeed[] = [
  {
    codigo: 'documento_identidade',
    nome: 'Documento de identidade',
    descricao: 'RG antigo ou Carteira de Identidade Nacional - CIN.',
    categoria: 'identidade',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: true,
    exige_frente: true,
    exige_verso: true,
    exige_numero_documento: true,
    exige_orgao_emissor: true,
    exige_uf_emissor: true,
    exige_data_emissao: true,
    exige_revisao_manual: true,
    permite_pdf: false,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'ALTO',
    provider_sugerido: 'cin_qrcode_ou_kyc',
    campos_esperados: ['nome', 'cpf', 'data_nascimento', 'nome_mae', 'numero_documento', 'orgao_emissor', 'uf_emissor', 'data_emissao', 'qr_code'],
    regras_validacao: ['nome_deve_bater_cadastro', 'cpf_deve_bater_cadastro', 'documento_precisa_ter_foto', 'arquivo_precisa_estar_legivel'],
    regras: [
      { codigo: 'nome_deve_bater_cadastro', descricao: 'Nome extraido deve ser compativel com o cadastro.' },
      { codigo: 'cpf_deve_bater_cadastro', descricao: 'CPF extraido deve bater com o cadastro.' },
      { codigo: 'documento_precisa_ter_foto', descricao: 'Documento de identidade precisa conter foto.' },
    ],
  },
  {
    codigo: 'cnh',
    nome: 'Carteira Nacional de Habilitacao',
    descricao: 'CNH fisica ou digital usada como documento de identificacao e habilitacao para motorista assistencial.',
    categoria: 'identidade',
    obrigatorio_motorista_assistencial: true,
    obrigatorio_busca: true,
    exige_frente: true,
    exige_verso: true,
    exige_validade: true,
    exige_numero_documento: true,
    exige_data_emissao: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'ALTO',
    provider_sugerido: 'senatran',
    campos_esperados: ['nome', 'cpf', 'numero_registro', 'categoria', 'data_nascimento', 'data_emissao', 'data_validade', 'numero_formulario_cnh', 'qr_code'],
    regras_validacao: ['nome_deve_bater_cadastro', 'cpf_deve_bater_cadastro', 'documento_nao_pode_estar_vencido'],
    regras: [
      { codigo: 'documento_nao_pode_estar_vencido', descricao: 'CNH precisa estar dentro da validade.' },
      { codigo: 'cnh_obrigatoria_para_motorista', descricao: 'Motorista assistencial precisa ter CNH aprovada.' },
    ],
  },
  {
    codigo: 'cpf',
    nome: 'CPF',
    descricao: 'Cadastro de Pessoa Fisica validado por documento ou dados cadastrais.',
    categoria: 'identidade',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: true,
    exige_numero_documento: true,
    exige_revisao_manual: false,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 5,
    nivel_risco: 'ALTO',
    provider_sugerido: 'cpf_kyc',
    campos_esperados: ['cpf', 'nome', 'data_nascimento'],
    regras_validacao: ['cpf_formato_valido', 'cpf_deve_bater_cadastro', 'cpf_mascarado_em_auditoria'],
    regras: [
      { codigo: 'cpf_formato_valido', descricao: 'CPF deve ter formato valido.' },
      { codigo: 'cpf_mascarado_em_auditoria', descricao: 'CPF completo nao pode aparecer em logs ou auditoria.' },
    ],
  },
  {
    codigo: 'selfie',
    nome: 'Selfie do prestador',
    descricao: 'Foto atual do prestador para comparacao visual ou biometrica futura.',
    categoria: 'biometria',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: true,
    exige_selfie: true,
    exige_revisao_manual: true,
    permite_pdf: false,
    permite_imagem: true,
    tamanho_maximo_mb: 8,
    nivel_risco: 'ALTO',
    provider_sugerido: 'face_match_liveness',
    campos_esperados: ['arquivo_imagem'],
    regras_validacao: ['selfie_precisa_ser_imagem', 'selfie_precisa_ter_face_principal', 'selfie_nao_deve_ser_publicada'],
    regras: [
      { codigo: 'selfie_precisa_ser_imagem', descricao: 'Selfie deve ser enviada como imagem.' },
      { codigo: 'selfie_nao_deve_ser_publicada', descricao: 'Selfie nao pode ser disponibilizada publicamente.' },
    ],
  },
  {
    codigo: 'comprovante_residencia',
    nome: 'Comprovante de residencia',
    descricao: 'Documento usado para confirmar endereco informado.',
    categoria: 'endereco',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: true,
    exige_frente: true,
    exige_validade: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    validade_dias: 90,
    nivel_risco: 'MEDIO',
    provider_sugerido: 'ocr',
    campos_esperados: ['nome', 'endereco', 'cidade', 'estado', 'cep', 'data_emissao'],
    regras_validacao: ['comprovante_residencia_max_90_dias', 'comprovante_precisa_ter_endereco'],
    regras: [
      { codigo: 'comprovante_residencia_max_90_dias', descricao: 'Comprovante deve ter emissao nos ultimos 90 dias.' },
    ],
  },
  {
    codigo: 'antecedentes_criminais_pf',
    nome: 'Certidao de antecedentes criminais - Policia Federal',
    descricao: 'Certidao emitida pela Policia Federal para verificar registros criminais federais.',
    categoria: 'antecedentes',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: true,
    exige_frente: true,
    exige_validade: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    validade_dias: 90,
    nivel_risco: 'CRITICO',
    provider_sugerido: 'pf_validacao_certidao',
    campos_esperados: ['nome', 'cpf', 'data_emissao', 'codigo_validacao', 'resultado', 'orgao_emissor'],
    regras_validacao: ['certidao_deve_ter_codigo_validacao', 'certidao_deve_estar_na_validade'],
    regras: [
      { codigo: 'certidao_deve_ter_codigo_validacao', descricao: 'Certidao precisa ter codigo de validacao.' },
      { codigo: 'certidao_deve_estar_na_validade', descricao: 'Certidao precisa estar dentro da validade definida.' },
    ],
  },
  {
    codigo: 'antecedentes_criminais_estadual',
    nome: 'Certidao criminal estadual',
    descricao: 'Certidao emitida por orgao estadual ou tribunal competente.',
    categoria: 'antecedentes',
    exige_frente: true,
    exige_validade: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    validade_dias: 90,
    nivel_risco: 'ALTO',
    provider_sugerido: 'manual',
    campos_esperados: ['nome', 'cpf', 'tribunal_ou_orgao', 'uf', 'data_emissao', 'codigo_validacao', 'resultado'],
    regras_validacao: ['validacao_varia_por_uf', 'revisao_manual_obrigatoria'],
  },
  {
    codigo: 'coren',
    nome: 'Registro profissional COREN',
    descricao: 'Documento profissional obrigatorio para enfermeiros.',
    categoria: 'profissional',
    obrigatorio_enfermeiro: true,
    obrigatorio_busca: true,
    exige_frente: true,
    exige_numero_documento: true,
    exige_uf_emissor: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'CRITICO',
    provider_sugerido: 'consulta_conselho_profissional',
    campos_esperados: ['numero_coren', 'uf_coren', 'categoria_profissional', 'nome', 'status_inscricao', 'data_validade'],
    regras_validacao: ['coren_obrigatorio_para_enfermeiro', 'coren_precisa_estar_regular'],
    regras: [
      { codigo: 'coren_obrigatorio_para_enfermeiro', descricao: 'Enfermeiro precisa ter COREN aprovado.' },
      { codigo: 'coren_precisa_estar_regular', descricao: 'Status do COREN precisa estar ativo ou regular.' },
    ],
  },
  {
    codigo: 'certificado_curso',
    nome: 'Certificado de curso',
    descricao: 'Certificado de curso relacionado a atividade de cuidado.',
    categoria: 'formacao',
    exige_frente: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'MEDIO',
    provider_sugerido: 'manual',
    campos_esperados: ['nome_aluno', 'nome_curso', 'instituicao', 'carga_horaria', 'data_conclusao', 'codigo_validacao'],
    regras_validacao: ['nome_deve_bater_cadastro', 'instituicao_precisa_estar_preenchida', 'carga_horaria_precisa_estar_preenchida'],
  },
  {
    codigo: 'comprovante_experiencia',
    nome: 'Comprovante de experiencia',
    descricao: 'Documento opcional para comprovar experiencia profissional.',
    categoria: 'experiencia',
    exige_frente: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'BAIXO',
    provider_sugerido: 'manual',
    campos_esperados: ['instituicao_ou_pessoa', 'periodo', 'descricao_atividade', 'contato_referencia'],
    regras_validacao: ['nao_deve_bloquear_cadastro_sozinho'],
  },
  {
    codigo: 'documento_profissional',
    nome: 'Documento profissional complementar',
    descricao: 'Carteira, registro, certificado ou comprovante profissional adicional.',
    categoria: 'profissional',
    exige_frente: true,
    exige_revisao_manual: true,
    permite_pdf: true,
    permite_imagem: true,
    tamanho_maximo_mb: 10,
    nivel_risco: 'MEDIO',
    provider_sugerido: 'manual',
    campos_esperados: ['tipo_documento', 'nome', 'orgao_ou_instituicao', 'numero_documento'],
    regras_validacao: ['revisao_manual_obrigatoria'],
  },
  {
    codigo: 'termo_responsabilidade',
    nome: 'Termo de responsabilidade',
    descricao: 'Aceite digital obrigatorio para atuacao na plataforma.',
    categoria: 'juridico',
    ...obrigatorioTodosPrestadores,
    obrigatorio_busca: false,
    requer_upload: false,
    exige_revisao_manual: false,
    permite_pdf: false,
    permite_imagem: false,
    tamanho_maximo_mb: 0,
    nivel_risco: 'ALTO',
    provider_sugerido: 'aceite_digital',
    campos_esperados: ['versao_termo', 'aceito_em', 'ip', 'user_agent'],
    regras_validacao: ['termo_deve_guardar_versao', 'aceite_deve_ser_auditado'],
  },
];

async function seedTiposDocumentos() {
  for (const tipo of tiposDocumentos) {
    const { regras = [], ...data } = tipo;
    const catalogo = await prisma.tipos_documentos.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });

    for (const regra of regras) {
      await prisma.tipos_documentos_regras.upsert({
        where: {
          tipo_documento_id_codigo: {
            tipo_documento_id: catalogo.id,
            codigo: regra.codigo,
          },
        },
        update: {
          descricao: regra.descricao,
          severidade: regra.severidade || 'ERRO',
          ativo: true,
        },
        create: {
          tipo_documento_id: catalogo.id,
          codigo: regra.codigo,
          descricao: regra.descricao,
          severidade: regra.severidade || 'ERRO',
        },
      });
    }
  }
}

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
  await seedTiposDocumentos();
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
