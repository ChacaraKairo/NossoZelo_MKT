/**
 * @author Kairo Chácara
 * @version 1.2
 * @date 22/04/2026
 * @description Service de Autenticação. Gerencia o ciclo de vida do login,
 * validação de credenciais via API e persistência de estado via Cookies.
 * Implementa tratamento rigoroso de erros de tipagem e logs de fluxo.
 */

import Cookies from 'js-cookie';

/* STREAMING_CHUNK:Defining Local Interfaces for Type Safety... */
/**
 * Interface de requisição de login.
 */
export interface LoginRequestBody {
  identificador: string;
  senha: string;
}

/**
 * Interface de resposta do servidor de autenticação.
 */
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

console.log(
  '[LOG-FLUXO] Inicializando LoginService: Motor de autenticação e gestão de segurança ativo.',
);

/* STREAMING_CHUNK:Implementing LoginService Class... */
class LoginService {
  /**
   * Realiza a tentativa de autenticação.
   * @param {LoginRequestBody} data - Credenciais do usuário.
   * @returns {Promise<LoginResponse>} - Dados da sessão.
   */
  public async login(
    data: LoginRequestBody,
  ): Promise<LoginResponse> {
    console.log(
      `[LOG-FLUXO] Iniciando tentativa de login para o identificador: ${data.identificador}`,
    );

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';
    const loginUrl = `${apiUrl}/nossozelo/login/login`;

    /* STREAMING_CHUNK:Executing Fetch Request with Credentials... */
    try {
      console.log(
        `[LOG-FLUXO] Disparando requisição POST para: ${loginUrl}`,
      );

      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(
        `[LOG-FLUXO] Resposta recebida da rede. Status HTTP: ${response.status}`,
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error(
            `[ERRO-FLUXO] Falha de Autenticação: Credenciais incorretas para ${data.identificador}.`,
          );
          throw new Error(
            'Usuário ou senha inválidos. Por favor, tente novamente.',
          );
        }

        let errorData;
        try {
          errorData = await response.json();
        } catch {
          console.error(
            '[ERRO-FLUXO] O backend retornou uma resposta não-JSON ou erro 500.',
          );
          throw new Error(
            `Erro no servidor (Status: ${response.status}).`,
          );
        }

        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          (errorData?.errors &&
            JSON.stringify(errorData.errors)) ||
          `Erro ${response.status}: ${response.statusText}`;
        console.error(
          `[ERRO-FLUXO] Erro reportado pela API: ${errorMessage}`,
        );
        throw new Error(`Falha no login: ${errorMessage}`);
      }

      const responseData: LoginResponse =
        await response.json();

      /* STREAMING_CHUNK:Handling Session Persistence... */
      if (responseData.token) {
        console.log(
          '[LOG-FLUXO] Token JWT detectado. Persistindo sessão via js-cookie.',
        );
        Cookies.set('token', responseData.token, {
          expires: 1, // 24 horas
          path: '/',
          sameSite: 'strict',
        });
        console.log(
          '[LOG-FLUXO] Cookie de sessão gravado com sucesso.',
        );
      }

      console.log(
        `[LOG-FLUXO] Fluxo de login finalizado com sucesso para: ${data.identificador}`,
      );
      return responseData;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro crítico no LoginService: ${error.message}`,
      );

      if (
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        console.error(
          '[ERRO-FLUXO] Erro de rede ou restrição de CORS impedindo a comunicação.',
        );
        throw new Error(
          'Não foi possível conectar ao servidor. Verifique sua internet ou a disponibilidade da API.',
        );
      }

      throw error;
    }
  }
}

export const loginService = new LoginService();
