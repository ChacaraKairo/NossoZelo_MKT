import Cookies from 'js-cookie';
import logger from '@/utils/logger';

export interface LoginRequestBody {
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  token?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
  message?: string;
}

const CONTEXTO = 'LoginService';

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
          throw new Error(
            'Usuario ou senha invalidos. Por favor, tente novamente.',
          );
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
        Cookies.set('token', responseData.token, {
          expires: 1,
          path: '/',
          sameSite: 'strict',
        });
        logger.debug(CONTEXTO, 'Cookie de sessao gravado com sucesso');
      }

      logger.info(CONTEXTO, 'Fluxo de login finalizado com sucesso', {
        identificador: data.identificador,
      });
      return responseData;
    } catch (error: unknown) {
      logger.error(CONTEXTO, 'Erro critico no LoginService', error);

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

      throw error;
    }
  }
}

export const loginService = new LoginService();
