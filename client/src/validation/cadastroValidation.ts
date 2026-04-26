import {
  cepValido,
  cpfValido,
  emailValido,
  telefoneValido,
} from '@/utils/validators';

export type ErrosCadastro = Record<string, string>;

const UFS_BRASIL = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

const SEXOS_PERMITIDOS = new Set([
  'feminino',
  'masculino',
  'outro',
]);

const CATEGORIAS_PRESTADOR = new Set([
  'cuidador',
  'enfermeiro',
  'acompanhante',
]);

const NOME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const TEXTO_ENDERECO_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9'.,ºª -]+$/;
const COREN_REGEX = /^COREN[-\s]?[A-Z]{2}\s?\d{4,10}$/i;

function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, '');
}

function textoObrigatorio(
  erros: ErrosCadastro,
  campo: string,
  valor: string,
  mensagem: string,
) {
  if (!valor.trim()) {
    erros[campo] = mensagem;
  }
}

function validarNomeCampo(
  erros: ErrosCadastro,
  campo: string,
  valor: string,
  rotulo: string,
) {
  const texto = valor.trim();
  if (!texto) {
    erros[campo] = `${rotulo} é obrigatório.`;
    return;
  }

  if (texto.length < 2) {
    erros[campo] = `${rotulo} deve ter pelo menos 2 caracteres.`;
    return;
  }

  if (!NOME_REGEX.test(texto)) {
    erros[campo] = `${rotulo} deve conter apenas letras, espaços, hífen ou apóstrofo.`;
  }
}

function validarDataNascimento(
  erros: ErrosCadastro,
  valor: string | Date | null,
) {
  if (!valor) {
    erros.dataNascimento = 'A data de nascimento é obrigatória.';
    return;
  }

  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) {
    erros.dataNascimento = 'Informe uma data de nascimento válida.';
    return;
  }

  const hoje = new Date();
  if (data > hoje) {
    erros.dataNascimento = 'A data de nascimento não pode ser futura.';
    return;
  }

  const idade =
    hoje.getFullYear() -
    data.getFullYear() -
    (hoje.getMonth() < data.getMonth() ||
    (hoje.getMonth() === data.getMonth() &&
      hoje.getDate() < data.getDate())
      ? 1
      : 0);

  if (idade < 18) {
    erros.dataNascimento = 'É necessário ter pelo menos 18 anos.';
  }
}

export function validarSenhaForte(senha: string) {
  return (
    senha.length >= 8 &&
    senha.length <= 72 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

export function mensagemSenhaForte() {
  return 'A senha deve ter 8 a 72 caracteres, com letra maiúscula, minúscula, número e caractere especial.';
}

export interface CadastroUsuarioPayload {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  dataNascimento: Date | null;
  sexo: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export function validarCadastroUsuario(
  dados: CadastroUsuarioPayload,
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  validarNomeCampo(erros, 'nome', dados.nome, 'Nome');
  validarNomeCampo(erros, 'sobrenome', dados.sobrenome, 'Sobrenome');

  if (!cpfValido(dados.cpf)) {
    erros.cpf = 'Informe um CPF válido.';
  }

  if (!telefoneValido(dados.telefone)) {
    erros.telefone = 'Informe um telefone com DDD válido.';
  }

  validarDataNascimento(erros, dados.dataNascimento);

  if (!SEXOS_PERMITIDOS.has(dados.sexo)) {
    erros.sexo = 'Selecione um gênero válido.';
  }

  validarEnderecoCadastro(erros, {
    cep: dados.cep,
    rua: dados.rua,
    numero: dados.numero,
    bairro: dados.bairro,
    cidade: dados.cidade,
    uf: dados.estado,
  });

  if (!emailValido(dados.email.trim())) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (!validarSenhaForte(dados.senha)) {
    erros.senha = mensagemSenhaForte();
  }

  if (dados.senha !== dados.confirmarSenha) {
    erros.confirmarSenha = 'As senhas não coincidem.';
  }

  return erros;
}

export interface DadosPessoaisPrestador {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string | null;
  sexo: string;
  email: string;
  senha: string;
}

export function validarDadosPessoaisPrestador(
  dados: DadosPessoaisPrestador,
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  validarNomeCampo(erros, 'nome', dados.nome, 'Nome');
  validarNomeCampo(erros, 'sobrenome', dados.sobrenome, 'Sobrenome');

  if (!cpfValido(dados.cpf)) {
    erros.cpf = 'Informe um CPF válido.';
  }

  if (!telefoneValido(dados.telefone)) {
    erros.telefone = 'Informe um telefone com DDD válido.';
  }

  validarDataNascimento(erros, dados.dataNascimento);

  if (!SEXOS_PERMITIDOS.has(dados.sexo)) {
    erros.sexo = 'Selecione um gênero válido.';
  }

  if (!emailValido(dados.email.trim())) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (!validarSenhaForte(dados.senha)) {
    erros.senha = mensagemSenhaForte();
  }

  return erros;
}

export interface EnderecoCadastro {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  raioAtuacao?: number;
}

export function validarEnderecoCadastro(
  erros: ErrosCadastro,
  dados: EnderecoCadastro,
) {
  if (!cepValido(dados.cep)) {
    erros.cep = 'Informe um CEP válido com 8 dígitos.';
  }

  const camposTexto: Array<[keyof EnderecoCadastro, string]> = [
    ['rua', 'Logradouro'],
    ['bairro', 'Bairro'],
    ['cidade', 'Cidade'],
  ];

  camposTexto.forEach(([campo, rotulo]) => {
    const valor = String(dados[campo] || '').trim();
    if (!valor) {
      erros[campo] = `${rotulo} é obrigatório.`;
      return;
    }
    if (!TEXTO_ENDERECO_REGEX.test(valor)) {
      erros[campo] = `${rotulo} contém caracteres inválidos.`;
    }
  });

  textoObrigatorio(
    erros,
    'numero',
    dados.numero,
    'Número é obrigatório.',
  );

  if (
    dados.numero.trim() &&
    !/^[A-Za-z0-9ºª/-]{1,12}$/.test(dados.numero.trim())
  ) {
    erros.numero = 'Número deve conter apenas letras, números, / ou -.';
  }

  const uf = dados.uf.trim().toUpperCase();
  if (!UFS_BRASIL.has(uf)) {
    erros.uf = 'Informe uma UF brasileira válida.';
  }

  if (
    dados.raioAtuacao !== undefined &&
    (!Number.isFinite(dados.raioAtuacao) ||
      dados.raioAtuacao < 1 ||
      dados.raioAtuacao > 100)
  ) {
    erros.raioAtuacao = 'Informe um raio de atuação entre 1 e 100 km.';
  }

  return erros;
}

export interface DadosProfissionaisPrestador {
  categoria: string;
  registro: string;
  experiencia: number;
  valorHora: number;
  bio: string;
}

export function validarDadosProfissionaisPrestador(
  dados: DadosProfissionaisPrestador,
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  if (!CATEGORIAS_PRESTADOR.has(dados.categoria)) {
    erros.categoria = 'Selecione uma categoria profissional válida.';
  }

  if (
    dados.categoria === 'enfermeiro' &&
    !COREN_REGEX.test(dados.registro.trim())
  ) {
    erros.registro = 'Informe um COREN válido, por exemplo COREN-SP 123456.';
  }

  if (
    !Number.isFinite(dados.experiencia) ||
    dados.experiencia < 0 ||
    dados.experiencia > 80
  ) {
    erros.experiencia = 'Experiência deve estar entre 0 e 80 anos.';
  }

  if (
    !Number.isFinite(dados.valorHora) ||
    dados.valorHora < 10 ||
    dados.valorHora > 1000
  ) {
    erros.valorHora = 'Valor hora deve estar entre R$ 10 e R$ 1.000.';
  }

  const bio = dados.bio.trim();
  if (bio.length < 40) {
    erros.bio = 'Escreva uma biografia com pelo menos 40 caracteres.';
  } else if (bio.length > 500) {
    erros.bio = 'A biografia deve ter no máximo 500 caracteres.';
  }

  return erros;
}

export interface DocumentosPrestador {
  foto: File | null;
  identidade: File | null;
  certificado: File | null;
  antecedentes: File | null;
}

function validarArquivo(
  erros: ErrosCadastro,
  campo: keyof DocumentosPrestador,
  arquivo: File | null,
  tiposPermitidos: string[],
  tamanhoMaxMb: number,
  obrigatorio = true,
) {
  if (!arquivo) {
    if (obrigatorio) erros[campo] = 'Documento obrigatório.';
    return;
  }

  if (!tiposPermitidos.includes(arquivo.type)) {
    erros[campo] = 'Formato de arquivo não permitido.';
    return;
  }

  const tamanhoMb = arquivo.size / 1024 / 1024;
  if (tamanhoMb > tamanhoMaxMb) {
    erros[campo] = `Arquivo deve ter no máximo ${tamanhoMaxMb} MB.`;
  }
}

export function validarDocumentosPrestador(
  documentos: DocumentosPrestador,
  categoria: string,
): ErrosCadastro {
  const erros: ErrosCadastro = {};

  validarArquivo(
    erros,
    'foto',
    documentos.foto,
    ['image/jpeg', 'image/png'],
    5,
  );
  validarArquivo(
    erros,
    'identidade',
    documentos.identidade,
    ['image/jpeg', 'image/png', 'application/pdf'],
    10,
  );
  validarArquivo(
    erros,
    'antecedentes',
    documentos.antecedentes,
    ['application/pdf'],
    10,
  );
  validarArquivo(
    erros,
    'certificado',
    documentos.certificado,
    ['application/pdf'],
    10,
    categoria === 'cuidador' || categoria === 'enfermeiro',
  );

  return erros;
}
