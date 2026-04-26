import validator from 'validator';

enum TipoUsuario {
  CLIENTE = 'cliente',
  CUIDADOR = 'cuidador',
  ENFERMEIRO = 'enfermeiro',
  ACOMPANHANTE = 'acompanhante',
  ADMIN = 'admin',
}

const DDD_VALIDOS_BR = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '24',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '53',
  '54',
  '55',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '71',
  '73',
  '74',
  '75',
  '77',
  '79',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
]);

type ErrosValidacao = Record<string, string[]>;

function normalizarDigitos(valor: unknown): string {
  return String(valor || '').replace(/\D/g, '');
}

function adicionarErro(
  erros: ErrosValidacao,
  campo: string,
  mensagem: string,
) {
  erros[campo] = [...(erros[campo] || []), mensagem];
}

function cpfValido(cpfOriginal: string): boolean {
  const cpf = normalizarDigitos(cpfOriginal);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (base: string, pesoInicial: number) => {
    const soma = base
      .split('')
      .reduce(
        (total, numero, indice) =>
          total + Number(numero) * (pesoInicial - indice),
        0,
      );
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(cpf.slice(0, 9), 10);
  const segundoDigito = calcularDigito(cpf.slice(0, 10), 11);

  return (
    primeiroDigito === Number(cpf[9]) &&
    segundoDigito === Number(cpf[10])
  );
}

function cepValido(cepOriginal: string): boolean {
  const cep = normalizarDigitos(cepOriginal);
  return cep.length === 8 && !/^(\d)\1+$/.test(cep);
}

function telefoneBrasileiroValido(telefoneOriginal: unknown): boolean {
  const telefone = normalizarDigitos(telefoneOriginal);

  if (!/^\d{10,11}$/.test(telefone) || /^(\d)\1+$/.test(telefone)) {
    return false;
  }

  const ddd = telefone.slice(0, 2);
  if (!DDD_VALIDOS_BR.has(ddd)) {
    return false;
  }

  const numero = telefone.slice(2);
  if (/^(\d)\1+$/.test(numero)) {
    return false;
  }

  if (telefone.length === 11) {
    return numero.startsWith('9');
  }

  return /^[2-5]/.test(numero);
}

function senhaForte(senha: unknown): boolean {
  if (typeof senha !== 'string') return false;

  return (
    senha.length >= 8 &&
    senha.length <= 72 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

function numeroOpcionalValido(valor: unknown, minimo = 0, maximo = 100000) {
  if (valor === undefined || valor === null || valor === '') return true;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= minimo && numero <= maximo;
}

function stringOpcionalValida(
  valor: unknown,
  maximo = 500,
): boolean {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === 'string' && valor.trim().length <= maximo)
  );
}

function validarCamposProfissionais(
  erros: ErrosValidacao,
  dados: any,
) {
  if (!stringOpcionalValida(dados.bio, 1000)) {
    adicionarErro(erros, 'bio', 'Bio deve ser um texto valido.');
  }

  if (!numeroOpcionalValido(dados.experiencia, 0, 80)) {
    adicionarErro(
      erros,
      'experiencia',
      'Experiencia deve estar entre 0 e 80 anos.',
    );
  }

  if (!numeroOpcionalValido(dados.valorHora, 0, 10000)) {
    adicionarErro(
      erros,
      'valorHora',
      'Valor hora deve ser um numero positivo.',
    );
  }

  if (!numeroOpcionalValido(dados.valorDiaria, 0, 100000)) {
    adicionarErro(
      erros,
      'valorDiaria',
      'Valor diaria deve ser um numero positivo.',
    );
  }

  if (!stringOpcionalValida(dados.disponibilidade, 255)) {
    adicionarErro(
      erros,
      'disponibilidade',
      'Disponibilidade deve ter ate 255 caracteres.',
    );
  }

  if (!stringOpcionalValida(dados.especialidades, 1000)) {
    adicionarErro(
      erros,
      'especialidades',
      'Especialidades deve ser um texto valido.',
    );
  }
}

export function validarCreateUsuarioDto(input: any): {
  valid: boolean;
  erros: ErrosValidacao;
} {
  console.log(
    '[LOG-FLUXO] Iniciando validarCreateUsuarioDto. Analisando estrutura do payload.',
  );

  const erros: ErrosValidacao = {};
  const usuario = input.usuario ?? input;
  const tipo = usuario?.tipo;

  if (!usuario || typeof usuario !== 'object') {
    return {
      valid: false,
      erros: {
        usuario: ['Dados de usuario sao obrigatorios.'],
      },
    };
  }

  if (
    !usuario.nome ||
    typeof usuario.nome !== 'string' ||
    usuario.nome.trim().length < 3 ||
    usuario.nome.trim().length > 100
  ) {
    adicionarErro(
      erros,
      'nome',
      'Nome deve ter entre 3 e 100 caracteres.',
    );
  }

  if (!usuario.email || !validator.isEmail(usuario.email)) {
    adicionarErro(erros, 'email', 'Email invalido.');
  }

  if (!senhaForte(usuario.senha)) {
    adicionarErro(
      erros,
      'senha',
      'Senha deve ter 8 a 72 caracteres, com letra maiuscula, minuscula, numero e caractere especial.',
    );
  }

  if (
    usuario.telefone &&
    !telefoneBrasileiroValido(usuario.telefone)
  ) {
    adicionarErro(
      erros,
      'telefone',
      'Telefone invalido. Use um numero brasileiro com DDD.',
    );
  }

  if (!cpfValido(usuario.cpf)) {
    adicionarErro(
      erros,
      'cpf',
      'CPF invalido. Informe 11 digitos validos, com ou sem mascara.',
    );
  }

  if (!cepValido(usuario.cep)) {
    adicionarErro(
      erros,
      'cep',
      'CEP invalido. Informe 8 digitos validos, com ou sem mascara.',
    );
  }

  if (
    usuario.data_nascimento &&
    !validator.isISO8601(usuario.data_nascimento)
  ) {
    adicionarErro(
      erros,
      'data_nascimento',
      'Data de nascimento invalida. Use ISO ou YYYY-MM-DD.',
    );
  }

  ['endereco', 'bairro', 'cidade', 'estado', 'pais'].forEach(
    (campo) => {
      if (
        usuario[campo] !== undefined &&
        usuario[campo] !== null &&
        typeof usuario[campo] !== 'string'
      ) {
        adicionarErro(
          erros,
          campo,
          `${campo} deve ser uma string.`,
        );
      }
    },
  );

  if (
    usuario.url_foto_perfil &&
    !validator.isURL(usuario.url_foto_perfil)
  ) {
    adicionarErro(
      erros,
      'url_foto_perfil',
      'URL de foto de perfil invalida.',
    );
  }

  if (
    !usuario.tipo ||
    !Object.values(TipoUsuario).includes(usuario.tipo)
  ) {
    adicionarErro(erros, 'tipo', 'Tipo de usuario invalido.');
  }

  if (tipo === TipoUsuario.CUIDADOR) {
    validarCamposProfissionais(erros, input.cuidador || {});
  }

  if (tipo === TipoUsuario.ACOMPANHANTE) {
    validarCamposProfissionais(erros, input.acompanhante || {});
  }

  if (tipo === TipoUsuario.ENFERMEIRO) {
    const enfermeiro = input.enfermeiro || {};
    validarCamposProfissionais(erros, enfermeiro);

    if (
      !enfermeiro.coren ||
      typeof enfermeiro.coren !== 'string' ||
      enfermeiro.coren.trim().length < 4 ||
      enfermeiro.coren.trim().length > 20
    ) {
      adicionarErro(
        erros,
        'coren',
        'COREN e obrigatorio para enfermeiros.',
      );
    }
  }

  if (tipo === TipoUsuario.ADMIN) {
    const admin = input.admin || {};
    if (admin.cargo && typeof admin.cargo !== 'string') {
      adicionarErro(erros, 'cargo', 'Cargo deve ser uma string.');
    }
    if (
      admin.permissao_total !== undefined &&
      typeof admin.permissao_total !== 'boolean'
    ) {
      adicionarErro(
        erros,
        'permissao_total',
        'Permissao total deve ser booleana.',
      );
    }
  }

  const isValid = Object.keys(erros).length === 0;

  if (isValid) {
    console.log('[LOG-FLUXO] DTO validado com sucesso.');
  } else {
    console.warn(
      `[LOG-FLUXO] Validacao do DTO finalizada com ${Object.keys(erros).length} erro(s).`,
    );
  }

  return {
    valid: isValid,
    erros,
  };
}
