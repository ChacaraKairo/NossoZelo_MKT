import Cookies from 'js-cookie';
import type {
  LoginRequestBody,
  LoginResponse,
} from '@/service/types/auth';

class LoginService {
  public async login(
    data: LoginRequestBody,
  ): Promise<LoginResponse> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error(
        'A variável de ambiente NEXT_PUBLIC_API_URL não está definida.',
      );
    }

    const loginUrl = `${apiUrl}/nossozelo/login/login`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Trata especificamente o erro de credenciais inválidas
        if (response.status === 401) {
          throw new Error(
            'Usuário ou senha inválidos. Por favor, tente novamente.',
          );
        }

        const errorData = await response
          .json()
          .catch(() => null);
        const errorMessage =
          errorData?.message ||
          `Erro ${response.status}: ${response.statusText}`;
        throw new Error(`Falha no login: ${errorMessage}`);
      }

      const responseData: LoginResponse =
        await response.json();

      if (responseData.token) {
        Cookies.set('token', responseData.token, {
          expires: 1,
          path: '/',
        });
      }

      return responseData;
    } catch (error) {
      console.error(
        'Erro detalhado no serviço de login:',
        error,
      );
      if (
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se a API está online e configurada para aceitar requisições deste domínio (CORS).',
        );
      }

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          'Ocorreu um erro inesperado durante o login.',
        );
      }
    }
  }
}

export const loginService = new LoginService();
