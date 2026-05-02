import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import ServiceUser from './Service_User';

const TEMPO_SESSAO_LOGIN = '7d';
const TEMPO_CADASTRO_SOCIAL = '30m';
type SocialProvider = 'google' | 'facebook';
type TipoCadastroSocial =
  | 'cliente'
  | 'cuidador'
  | 'enfermeiro'
  | 'acompanhante';

const TIPOS_CADASTRO_SOCIAL = new Set<TipoCadastroSocial>([
  'cliente',
  'cuidador',
  'enfermeiro',
  'acompanhante',
]);

function obterJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET nao configurado. Login indisponivel ate o ambiente ser corrigido.',
    );
  }

  return jwtSecret;
}

function obterFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function obterBackendUrl() {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    'http://localhost:4000'
  );
}

function criarTokenSessao(user: {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  email_confirmado?: boolean;
}) {
  return sign(
    {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      email_confirmado: user.email_confirmado,
    },
    obterJwtSecret(),
    { expiresIn: TEMPO_SESSAO_LOGIN },
  );
}

function criarUrlCallback(provider: SocialProvider) {
  const redirectUriConfigurada =
    provider === 'google'
      ? process.env.GOOGLE_REDIRECT_URI
      : process.env.FACEBOOK_REDIRECT_URI;

  if (redirectUriConfigurada) {
    return redirectUriConfigurada;
  }

  return `${obterBackendUrl()}/nossozelo/login/social/${provider}/callback`;
}

function criarSenhaSocial() {
  return `Nz!${nanoid(32)}aA1`;
}

function normalizarDigitos(valor: unknown) {
  return String(valor || '').replace(/\D/g, '');
}

function valorObrigatorio(valor: unknown) {
  return String(valor || '').trim();
}

function normalizarDecimal(valor: unknown) {
  if (valor === undefined || valor === null || valor === '') return valor;
  return String(valor).replace(',', '.');
}

function montarPerfilProfissional(data: any, tipo: TipoCadastroSocial) {
  const dados = data?.[tipo] || data?.perfil || data || {};

  return {
    bio: valorObrigatorio(dados.bio),
    experiencia:
      dados.experiencia ?? dados.anos_experiencia ?? data.anos_experiencia,
    valorHora: normalizarDecimal(
      dados.valorHora ?? dados.valor_hora ?? data.valor_hora,
    ),
    valorDiaria: normalizarDecimal(
      dados.valorDiaria ?? dados.valor_diaria ?? data.valor_diaria,
    ),
    disponibilidade:
      dados.disponibilidade ?? data.disponibilidade ?? null,
    especialidades:
      dados.especialidades ?? data.especialidades ?? null,
    documento_profissional:
      dados.documento_profissional ?? data.documento_profissional ?? null,
    coren: dados.coren ?? data.coren,
  };
}

function validarComplementoCadastroSocial(data: any) {
  const tipo = String(data?.tipo || 'cliente') as TipoCadastroSocial;

  if (!TIPOS_CADASTRO_SOCIAL.has(tipo)) {
    throw new Error('Tipo de conta invalido para cadastro social.');
  }

  const camposObrigatorios = [
    ['nome', data?.nome],
    ['telefone', data?.telefone],
    ['cpf', data?.cpf],
    ['cep', data?.cep],
    ['endereco', data?.endereco],
    ['bairro', data?.bairro],
    ['cidade', data?.cidade],
    ['estado', data?.estado],
  ] as const;

  for (const [campo, valor] of camposObrigatorios) {
    if (!valorObrigatorio(valor)) {
      throw new Error(`Campo obrigatorio ausente: ${campo}.`);
    }
  }

  if (normalizarDigitos(data.cpf).length !== 11) {
    throw new Error('CPF invalido.');
  }

  if (normalizarDigitos(data.telefone).length < 10) {
    throw new Error('Telefone invalido.');
  }

  if (normalizarDigitos(data.cep).length !== 8) {
    throw new Error('CEP invalido.');
  }

  if (tipo !== 'cliente') {
    const perfil = montarPerfilProfissional(data, tipo);
    if (!valorObrigatorio(perfil.bio)) {
      throw new Error('Bio profissional e obrigatoria.');
    }
    if (!valorObrigatorio(perfil.disponibilidade)) {
      throw new Error('Disponibilidade profissional e obrigatoria.');
    }
    if (!valorObrigatorio(perfil.especialidades)) {
      throw new Error('Especialidades sao obrigatorias.');
    }
  }

  if (tipo === 'enfermeiro') {
    const perfil = montarPerfilProfissional(data, tipo);
    if (!valorObrigatorio(perfil.coren)) {
      throw new Error('COREN e obrigatorio para enfermeiros.');
    }
  }

  return tipo;
}

function mascararIdentificador(identificador: string) {
  if (identificador.includes('@')) {
    return identificador.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  }

  return `***${identificador.replace(/\D/g, '').slice(-4)}`;
}

export class ServiceAuth {
  static iniciarLoginSocial(provider: SocialProvider, state: string) {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error('GOOGLE_CLIENT_ID nao configurado.');

      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', criarUrlCallback('google'));
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('prompt', 'select_account');
      url.searchParams.set('state', state);
      return url.toString();
    }

    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) throw new Error('FACEBOOK_CLIENT_ID nao configurado.');

    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', criarUrlCallback('facebook'));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email,public_profile');
    url.searchParams.set('state', state);
    return url.toString();
  }

  static async concluirCallbackSocial(
    provider: SocialProvider,
    code: string,
  ) {
    const perfil =
      provider === 'google'
        ? await this.obterPerfilGoogle(code)
        : await this.obterPerfilFacebook(code);

    if (!perfil.email) {
      throw new Error('O provedor social nao retornou um e-mail valido.');
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email: perfil.email },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        email_confirmado: true,
      },
    });

    if (usuario) {
      const token = criarTokenSessao(usuario);
      return `${obterFrontendUrl()}/auth/social-callback?token=${encodeURIComponent(token)}`;
    }

    const tokenCadastro = sign(
      {
        purpose: 'social_signup',
        provider,
        email: perfil.email,
        nome: perfil.nome,
        url_foto_perfil: perfil.foto || '',
      },
      obterJwtSecret(),
      { expiresIn: TEMPO_CADASTRO_SOCIAL },
    );

    return `${obterFrontendUrl()}/cadastro-social?token=${encodeURIComponent(tokenCadastro)}`;
  }

  static async completarCadastroSocial(data: any) {
    const { verify } = await import('jsonwebtoken');
    if (!data?.socialToken) {
      throw new Error('Token de cadastro social obrigatorio.');
    }

    const decoded = verify(
      String(data?.socialToken || ''),
      obterJwtSecret(),
    ) as {
      purpose?: string;
      email?: string;
      nome?: string;
      url_foto_perfil?: string;
    };

    if (decoded.purpose !== 'social_signup' || !decoded.email) {
      throw new Error('Token de cadastro social invalido.');
    }

    const tipo = validarComplementoCadastroSocial(data);

    const existente = await prisma.usuarios.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        email_confirmado: true,
      },
    });

    if (existente) {
      return { token: criarTokenSessao(existente), user: existente };
    }

    const cpf = normalizarDigitos(data.cpf);
    const cpfExistente = await prisma.usuarios.findUnique({
      where: { cpf },
      select: { id: true },
    });

    if (cpfExistente) {
      throw new Error('CPF ja cadastrado.');
    }

    const perfilProfissional =
      tipo === 'cliente' ? null : montarPerfilProfissional(data, tipo);

    const resultado = await ServiceUser.criarUsuarioComTipo({
      emailConfirmadoInicial: true,
      usuario: {
        nome: data.nome || decoded.nome || 'Usuario NossoZelo',
        email: decoded.email,
        senha: criarSenhaSocial(),
        telefone: normalizarDigitos(data.telefone),
        cpf,
        sexo: data.sexo || 'outro',
        data_nascimento: data.data_nascimento || null,
        cep: normalizarDigitos(data.cep),
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        pais: 'Brasil',
        url_foto_perfil:
          data.url_foto_perfil || decoded.url_foto_perfil || '',
        tipo,
        email_confirmado: true,
      },
      ...(tipo === 'cuidador' ? { cuidador: perfilProfissional } : {}),
      ...(tipo === 'enfermeiro' ? { enfermeiro: perfilProfissional } : {}),
      ...(tipo === 'acompanhante'
        ? { acompanhante: perfilProfissional }
        : {}),
    });

    const usuarioCriado = resultado.data;
    return {
      token: criarTokenSessao({
        id: usuarioCriado.id,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        tipo: usuarioCriado.tipo,
        email_confirmado: usuarioCriado.email_confirmado,
      }),
      user: {
        id: usuarioCriado.id,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        tipo: usuarioCriado.tipo,
        email_confirmado: usuarioCriado.email_confirmado,
      },
    };
  }

  private static async obterPerfilGoogle(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth nao configurado.');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: criarUrlCallback('google'),
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Falha ao validar login com Google.');
    }

    const tokenData = await tokenResponse.json();
    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
    );

    if (!profileResponse.ok) {
      throw new Error('Falha ao carregar perfil do Google.');
    }

    const profile = await profileResponse.json();
    return {
      email: String(profile.email || ''),
      nome: String(profile.name || ''),
      foto: String(profile.picture || ''),
    };
  }

  private static async obterPerfilFacebook(code: string) {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('Facebook OAuth nao configurado.');
    }

    const tokenUrl = new URL(
      'https://graph.facebook.com/v19.0/oauth/access_token',
    );
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', criarUrlCallback('facebook'));
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl);
    if (!tokenResponse.ok) {
      throw new Error('Falha ao validar login com Facebook.');
    }

    const tokenData = await tokenResponse.json();
    const profileUrl = new URL('https://graph.facebook.com/me');
    profileUrl.searchParams.set('fields', 'id,name,email,picture');
    profileUrl.searchParams.set('access_token', tokenData.access_token);

    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) {
      throw new Error('Falha ao carregar perfil do Facebook.');
    }

    const profile = await profileResponse.json();
    return {
      email: String(profile.email || ''),
      nome: String(profile.name || ''),
      foto: String(profile.picture?.data?.url || ''),
    };
  }

  static async login(data: {
    identificador: string;
    senha: string;
  }) {
    const identificador = String(data.identificador || '').trim();
    const identificadorLog = mascararIdentificador(identificador);
    const isEmail = identificador.includes('@');

    logger.info('AuthService: iniciando login', {
      identificador: identificadorLog,
      tipoIdentificador: isEmail ? 'email' : 'cpf',
    });

    try {
      const user = await prisma.usuarios.findUnique({
        where: isEmail ? { email: identificador } : { cpf: identificador },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          senha: true,
          email_confirmado: true,
        },
      });

      if (!user) {
        logger.warn('AuthService: usuário não encontrado', {
          identificador: identificadorLog,
        });
        throw new Error('Usuário ou senha inválidos.');
      }

      const senhaValida = await compare(data.senha, user.senha);

      if (!senhaValida) {
        logger.warn('AuthService: senha inválida', {
          usuarioId: user.id,
          tipo: user.tipo,
        });
        throw new Error('Usuário ou senha inválidos.');
      }

      const token = criarTokenSessao(user);

      logger.info('AuthService: login concluído', {
        usuarioId: user.id,
        tipo: user.tipo,
        expiraEm: TEMPO_SESSAO_LOGIN,
      });

      return {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          email_confirmado: user.email_confirmado,
        },
      };
    } catch (error: any) {
      logger.warn('AuthService: falha no login', {
        identificador: identificadorLog,
        erro: error?.message || 'Erro desconhecido',
      });
      throw error;
    }
  }
}

export default ServiceAuth;
