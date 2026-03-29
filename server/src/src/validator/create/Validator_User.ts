import validator from 'validator';

enum TipoUsuario {
  CLIENTE = 'cliente',
  CUIDADOR = 'cuidador',
  ENFERMEIRO = 'enfermeiro',
  ACOMPANHANTE = 'acompanhante',
  ADMIN = 'admin',
}

interface UsuarioBase {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  url_foto_perfil?: string;
  tipo: TipoUsuario;
}

interface CuidadorExtra {
  bio?: string;
  experiencia?: string;
  documento_profissional?: string;
}

interface EnfermeiroExtra {
  coren: string;
  especialidade?: string;
  experiencia?: string;
}

interface AdminExtra {
  cargo?: string;
  permissao_total?: boolean;
}

export function validarCreateUsuarioDto(input: any): {
  valid: boolean;
  erros: Record<string, string[]>;
} {
  const erros: Record<string, string[]> = {};

  const usuario = input.usuario ?? input;
  const tipo = usuario.tipo;

  // ========== VALIDAÇÃO DO USUÁRIO BASE ==========
  if (
    !usuario.nome ||
    typeof usuario.nome !== 'string' ||
    usuario.nome.trim().length < 3 ||
    usuario.nome.trim().length > 100
  ) {
    erros.nome = ['Nome deve ter entre 3 e 100 caracteres'];
  }

  if (!usuario.email || !validator.isEmail(usuario.email)) {
    erros.email = ['Email inválido'];
  }

  if (
    !usuario.senha ||
    typeof usuario.senha !== 'string' ||
    usuario.senha.length < 6 ||
    usuario.senha.length > 255
  ) {
    erros.senha = [
      'Senha deve ter entre 6 e 255 caracteres',
    ];
  }

  if (
    usuario.telefone &&
    !validator.isMobilePhone(usuario.telefone, 'pt-BR')
  ) {
    erros.telefone = [
      'Telefone inválido. Use formato nacional brasileiro',
    ];
  }

  if (
    !usuario.cpf ||
    !validator.matches(
      usuario.cpf,
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    )
  ) {
    erros.cpf = [
      'CPF inválido. Formato esperado: 000.000.000-00',
    ];
  }

  if (
    usuario.data_nascimento &&
    !validator.isISO8601(usuario.data_nascimento)
  ) {
    erros.data_nascimento = [
      'Data de nascimento inválida. Use o formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ',
    ];
  }

  if (
    usuario.endereco &&
    typeof usuario.endereco !== 'string'
  ) {
    erros.endereco = ['Endereço deve ser uma string'];
  }

  if (
    usuario.cidade &&
    typeof usuario.cidade !== 'string'
  ) {
    erros.cidade = ['Cidade deve ser uma string'];
  }

  if (
    usuario.estado &&
    typeof usuario.estado !== 'string'
  ) {
    erros.estado = ['Estado deve ser uma string'];
  }

  if (usuario.pais && typeof usuario.pais !== 'string') {
    erros.pais = ['País deve ser uma string'];
  }

  if (
    usuario.url_foto_perfil &&
    !validator.isURL(usuario.url_foto_perfil)
  ) {
    erros.url_foto_perfil = [
      'URL de foto de perfil inválida',
    ];
  }

  if (
    !usuario.tipo ||
    !Object.values(TipoUsuario).includes(usuario.tipo)
  ) {
    erros.tipo = ['Tipo de usuário inválido'];
  }

  // ========== VALIDAÇÕES POR TIPO DE USUÁRIO ==========
  if (tipo === TipoUsuario.CUIDADOR) {
    const cuidador = input.cuidador || {};
    if (cuidador.bio && typeof cuidador.bio !== 'string') {
      erros.bio = ['Bio deve ser uma string'];
    }
    if (
      cuidador.experiencia &&
      typeof cuidador.experiencia !== 'string'
    ) {
      erros.experiencia = [
        'Experiência deve ser uma string',
      ];
    }
    if (
      cuidador.documento_profissional &&
      typeof cuidador.documento_profissional !== 'string'
    ) {
      erros.documento_profissional = [
        'Documento profissional deve ser uma string',
      ];
    }
  }

  if (tipo === TipoUsuario.ENFERMEIRO) {
    const enfermeiro = input.enfermeiro || {};
    if (
      !enfermeiro.coren ||
      typeof enfermeiro.coren !== 'string'
    ) {
      erros.coren = [
        'COREN é obrigatório e deve ser uma string',
      ];
    }
    if (
      enfermeiro.especialidade &&
      typeof enfermeiro.especialidade !== 'string'
    ) {
      erros.especialidade = [
        'Especialidade deve ser uma string',
      ];
    }
    if (
      enfermeiro.experiencia &&
      typeof enfermeiro.experiencia !== 'string'
    ) {
      erros.experiencia = [
        'Experiência deve ser uma string',
      ];
    }
  }

  if (tipo === TipoUsuario.ADMIN) {
    const admin = input.admin || {};
    if (admin.cargo && typeof admin.cargo !== 'string') {
      erros.cargo = ['Cargo deve ser uma string'];
    }
    if (
      admin.permissao_total !== undefined &&
      typeof admin.permissao_total !== 'boolean'
    ) {
      erros.permissao_total = [
        'Permissão total deve ser um booleano',
      ];
    }
  }

  return {
    valid: Object.keys(erros).length === 0,
    erros,
  };
}
