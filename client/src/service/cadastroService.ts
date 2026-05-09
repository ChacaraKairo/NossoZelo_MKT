/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 1.2
 * @date 23/04/2026
 * @description Service ajustado para garantir a captura do ID do usuário após o cadastro.
 */

import { getNossoZeloApiUrl } from '@/config/api';

export interface CadastroPayload {
  usuario: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    cpf: string;
    sexo: string;
    data_nascimento: string | null;
    cep: string;
    endereco: string;
    bairro?: string;
    cidade: string;
    estado: string;
    pais: string;
    url_foto_perfil?: string;
    tipo: string;
  };
  cuidador?: {
    bio: string;
    experiencia: number;
    valorHora?: number;
    valorDiaria?: number;
    disponibilidade?: string;
    especialidades?: string;
    documentos?: string;
  };
  enfermeiro?: {
    coren: string;
    bio: string;
    experiencia: number;
    valorHora?: number;
    valorDiaria?: number;
    disponibilidade?: string;
    especialidades?: string;
    documentos?: string;
  };
  acompanhante?: {
    bio: string;
    experiencia: number;
    valorHora?: number;
    valorDiaria?: number;
    disponibilidade?: string;
    especialidades?: string;
    documentos?: string;
  };
}

type ErrosApi = Record<string, string[]>;

export class CadastroApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    erros?: ErrosApi,
  ) {
    super(message);
    this.name = 'CadastroApiError';
    this.status = status;

    if (erros) {
      this.fieldErrors = Object.fromEntries(
        Object.entries(erros).map(([campo, mensagens]) => [
          campo,
          mensagens[0] || message,
        ]),
      );
    }
  }
}

/**
 * Realiza o cadastro e garante o retorno do ID para o fluxo de upload.
 */
export const cadastrarUsuario = async (
  dados: CadastroPayload,
): Promise<any> => {  try {
    const URL_COMPLETA = `${getNossoZeloApiUrl()}/create-users/usuario`;

    const resposta = await fetch(URL_COMPLETA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erroData = await resposta
        .json()
        .catch(() => ({ message: 'Erro desconhecido.' }));
      throw new CadastroApiError(
        erroData.error ||
          erroData.message ||
          erroData.mensagem ||
          'Falha ao cadastrar.',
        resposta.status,
        erroData.erros,
      );
    }

    const resultado = await resposta.json();

    // 🔥 MAPEAMENTO DE ACORDO COM O LOG REAL:
    // O log mostrou que o ID está em: resultado.data.data.id
    const idFinal =
      resultado.data?.data?.id ||
      resultado.id ||
      resultado.data?.id ||
      resultado.usuario?.id;
    const uploadToken =
      resultado.data?.uploadToken ||
      resultado.uploadToken ||
      resultado.upload_token;    if (!idFinal) {    }

    return {
      ...resultado,
      id: idFinal, // Injeta na raiz para o Hook useFinalizarCadastro consumir
      uploadToken,
    };
  } catch (error: any) {    throw error;
  }
};
