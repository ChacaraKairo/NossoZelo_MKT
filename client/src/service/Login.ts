import { OnboardingStatus } from '@/types/onboarding';
import { getNossoZeloApiUrl } from '@/config/api';
import logger from '@/utils/logger';

export interface LoginRequestBody {
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  user?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    email_confirmado?: boolean;
  };
  usuario?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
    email_confirmado?: boolean;
  };
  message?: string;
  onboardingStatus?: OnboardingStatus;
}

const CONTEXTO = 'LoginService';
const MENSAGEM_CREDENCIAIS_INVALIDAS =
  'Usuario ou senha invalidos. Por favor, tente novamente.';

function mascararIdentificador(identificador: string) {
  const valor = identificador.trim();

  if (valor.includes('@')) {
    return valor.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  }

  const digitos = valor.replace(/\D/g, '');
  if (digitos.length >= 4) {
    return `***${digitos.slice(-4)}`;
  }

  return '***';
}

function armazenarUsuarioSessao(responseData: LoginResponse) {
  if (typeof window === 'undefined') return;
  const usuario = responseData.user || responseData.usuario;
  if (usuario) {
    sessionStorage.setItem('nossozelo_usuario', JSON.stringify(usuario));
  }
}

class LoginService {
  public persistirSessao(_token?: string) {
    logger.warn(CONTEXTO, 'Persistencia manual de JWT desativada; usando cookie HttpOnly.');
  }

  public iniciarLoginSocial(provider: 'google' | 'facebook') {
    logger.info(CONTEXTO, 'Iniciando login social', { provider });
    window.location.href = `${getNossoZeloApiUrl()}/login/social/${provider}`;
  }

  public async completarCadastroSocial(data: Record<string, unknown>) {
    const response = await fetch(
      `${getNossoZeloApiUrl()}/login/social/completar-cadastro`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
    );

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      logger.warn(CONTEXTO, 'Cadastro social recusado pela API', {
        status: response.status,
      });
      throw new Error(
        responseData.error ||
          responseData.message ||
          'Nao foi possivel completar o cadastro social.',
      );
    }

    const resposta = responseData as LoginResponse;
    armazenarUsuarioSessao(resposta);
    return resposta;
  }

  public async solicitarRecuperacaoSenha(email: string) {
    const response = await fetch(
      `${getNossoZeloApiUrl()}/login/recuperar-senha`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
    );

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        responseData.erro ||
          responseData.error ||
          'Nao foi possivel enviar o e-mail de recuperacao.',
      );
    }

    return responseData;
  }

  public async redefinirSenha(token: string, novaSenha: string) {
    const response = await fetch(
      `${getNossoZeloApiUrl()}/login/redefinir-senha`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      },
    );

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        responseData.erro ||
          responseData.error ||
          'Nao foi possivel redefinir a senha.',
      );
    }

    return responseData;
  }

  public async login(data: LoginRequestBody): Promise<LoginResponse> {
    logger.info(CONTEXTO, 'Iniciando tentativa de login', {
      identificador: mascararIdentificador(data.identificador),
    });

    const loginUrl = `${getNossoZeloApiUrl()}/login/login`;

    try {
      logger.debug(CONTEXTO, 'Disparando requisicao de login', {
        loginUrl,
      });

      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      logger.debug(CONTEXTO, 'Resposta recebida da rede', {
        status: response.status,
      });

      if (!response.ok) {
        if (response.status === 401) {
          logger.warn(CONTEXTO, 'Credenciais incorretas', {
            identificador: mascararIdentificador(data.identificador),
          });
          throw new Error(MENSAGEM_CREDENCIAIS_INVALIDAS);
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          logger.error(
            CONTEXTO,
            'Backend retornou resposta nao JSON ou erro 500',
            { status: response.status },
          );
          throw new Error(
            `Erro no servidor (Status: ${response.status}).`,
          );
        }

        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          (errorData?.errors && JSON.stringify(errorData.errors)) ||
          `Erro ${response.status}: ${response.statusText}`;

        logger.error(CONTEXTO, 'Erro reportado pela API', {
          errorMessage,
        });
        throw new Error(`Falha no login: ${errorMessage}`);
      }

      const responseData: LoginResponse = await response.json();

      logger.info(CONTEXTO, 'Fluxo de login finalizado com sucesso', {
        identificador: mascararIdentificador(data.identificador),
      });
      armazenarUsuarioSessao(responseData);
      return responseData;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === MENSAGEM_CREDENCIAIS_INVALIDAS
      ) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        logger.error(
          CONTEXTO,
          'Erro de rede ou restricao de CORS impedindo a comunicacao',
          error,
        );
        throw new Error(
          'Nao foi possivel conectar ao servidor. Verifique sua internet ou a disponibilidade da API.',
        );
      }

      logger.error(CONTEXTO, 'Erro critico no LoginService', error);
      throw error;
    }
  }

  public async me(): Promise<LoginResponse> {
    const response = await fetch(`${getNossoZeloApiUrl()}/login/me`, {
      credentials: 'include',
    });

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(responseData.error || 'Sessao invalida.');
    }

    const resposta = responseData as LoginResponse;
    armazenarUsuarioSessao(resposta);
    return resposta;
  }

  public async logout() {
    await fetch(`${getNossoZeloApiUrl()}/login/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined);
  }
}

export const loginService = new LoginService();
