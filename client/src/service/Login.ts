import Cookies from 'js-cookie';
import logger from '@/utils/logger';

export interface LoginRequestBody {
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
  usuario?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
  message?: string;
}

const CONTEXTO = 'LoginService';
const MENSAGEM_CREDENCIAIS_INVALIDAS =
  'Usuario ou senha invalidos. Por favor, tente novamente.';
const DIAS_SESSAO_LOGIN = 7;

function obterExpiracaoCookie(token: string) {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return DIAS_SESSAO_LOGIN;

    const base64 = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { exp?: number };

    if (!payload.exp) return DIAS_SESSAO_LOGIN;

    return new Date(payload.exp * 1000);
  } catch {
    return DIAS_SESSAO_LOGIN;
  }
}

function gravarCookieSessao(token: string) {
  const opcoes = {
    expires: obterExpiracaoCookie(token),
    path: '/',
    sameSite: 'strict' as const,
    secure:
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:',
  };

  Cookies.set('token', token, opcoes);
  Cookies.set('zelo_token', token, opcoes);
}

class LoginService {
  public async login(data: LoginRequestBody): Promise<LoginResponse> {
    logger.info(CONTEXTO, 'Iniciando tentativa de login', {
      identificador: data.identificador,
    });

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const loginUrl = `${apiUrl}/nossozelo/login/login`;

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
            identificador: data.identificador,
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

      if (responseData.token) {
        logger.debug(CONTEXTO, 'Token JWT detectado. Persistindo sessao');
        gravarCookieSessao(responseData.token);
        logger.debug(CONTEXTO, 'Cookie de sessao gravado com sucesso');
      }

      logger.info(CONTEXTO, 'Fluxo de login finalizado com sucesso', {
        identificador: data.identificador,
      });
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
}

export const loginService = new LoginService();
