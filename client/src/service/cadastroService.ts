// client/src/service/cadastroService.ts

// Esta interface define a estrutura do objeto que vamos enviar para a API.
// É uma boa prática tipar os dados que traficam entre o front e o back.
interface CadastroPayload {
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
    url_foto_perfil: string;
    tipo: string;
    email_confirmado: boolean;
  };
}

/**
 * Envia os dados de cadastro de um novo utilizador para a API.
 * @param dados O objeto contendo todos os dados do utilizador.
 * @returns A resposta da API.
 */
export const cadastrarUsuario = async (
  dados: CadastroPayload,
) => {
  const URL_API =
    'http://localhost:4000/nossozelo/create-users/usuario';

  try {
    const resposta = await fetch(URL_API, {
      method: 'POST',
      headers: {
        // Informa à API que estamos a enviar dados no formato JSON
        'Content-Type': 'application/json',
      },
      // Converte o nosso objeto JavaScript para uma string JSON
      body: JSON.stringify(dados),
    });

    // Se a resposta da API não for de sucesso (ex: erro 400, 500),
    // vamos ler a mensagem de erro que a API enviou e lançá-la.
    if (!resposta.ok) {
      const erroData = await resposta.json();
      throw new Error(
        erroData.message ||
          'Ocorreu um erro ao tentar cadastrar.',
      );
    }

    // Se a resposta for de sucesso, retornamos os dados que a API enviou de volta.
    console.log(dados);
    return await resposta.json();
  } catch (error) {
    // Se o erro for de rede (ex: API offline) ou o erro que lançámos acima,
    // ele será capturado aqui. Re-lançamos para que o componente possa tratar.
    console.error('Erro no serviço de cadastro:', error);
    throw error;
  }
};
