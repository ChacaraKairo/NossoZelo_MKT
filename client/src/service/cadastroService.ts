/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 1.2
 * @date 23/04/2026
 * @description Service ajustado para garantir a captura do ID do usuário após o cadastro.
 */

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
    documentos?: string;
  };
  enfermeiro?: {
    coren: string;
    bio: string;
    experiencia: number;
    valorHora?: number;
    documentos?: string;
  };
  acompanhante?: {
    bio: string;
    experiencia: number;
    valorHora?: number;
    documentos?: string;
  };
}

/**
 * Realiza o cadastro e garante o retorno do ID para o fluxo de upload.
 */
export const cadastrarUsuario = async (
  dados: CadastroPayload,
): Promise<any> => {
  console.log(
    `[LOG-FLUXO] Iniciando cadastrarUsuario para: ${dados.usuario.email}.`,
  );

  try {
    const api_url =
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000';
    const URL_COMPLETA = `${api_url}/nossozelo/create-users/usuario`;

    const resposta = await fetch(URL_COMPLETA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erroData = await resposta
        .json()
        .catch(() => ({ message: 'Erro desconhecido.' }));
      throw new Error(
        erroData.message || 'Falha ao cadastrar.',
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

    console.log(
      `[LOG-FLUXO] Sucesso: ID extraído para upload: ${idFinal || 'NÃO ENCONTRADO'}`,
    );

    if (!idFinal) {
      console.warn(
        '[AVISO-ESTRUTURA] Backend não enviou ID reconhecido:',
        resultado,
      );
    }

    return {
      ...resultado,
      id: idFinal, // Injeta na raiz para o Hook useFinalizarCadastro consumir
    };
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Erro crítico: ${error.message}`,
    );
    throw error;
  }
};
