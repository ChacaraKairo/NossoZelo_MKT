// client/src/service/cadastroService.ts

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
  // Opcionais: Dependendo do "tipo" selecionado, um destes será enviado
  cuidador?: {
    bio: string;
    experiencia: number;
    valorHora?: number;
    documentos?: string; // URL do S3
  };
  enfermeiro?: {
    coren: string;
    bio: string;
    experiencia: number;
    valorHora?: number;
    documentos?: string; // URL do S3
  };
  acompanhante?: {
    bio: string;
    experiencia: number;
    valorHora?: number;
    documentos?: string; // URL do S3
  };
}

export const cadastrarUsuario = async (
  dados: CadastroPayload,
) => {
  try {
    // 1. Juntamos a variável de ambiente com a rota real do backend
    const URL_COMPLETA = `${process.env.NEXT_PUBLIC_API_URL}/nossozelo/create-users/usuario`;

    const resposta = await fetch(URL_COMPLETA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      // 2. Proteção para caso o backend retorne HTML (Ex: erro 404 ou 500)
      let erroData;
      try {
        erroData = await resposta.json();
      } catch (err) {
        throw new Error(
          `Erro no servidor (Status: ${resposta.status}). O backend não retornou um JSON válido.`,
        );
      }

      throw new Error(
        erroData.message ||
          'Ocorreu um erro ao tentar cadastrar.',
      );
    }

    return await resposta.json();
  } catch (error) {
    console.error('Erro no serviço de cadastro:', error);
    throw error;
  }
};
