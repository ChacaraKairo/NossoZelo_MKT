import axios from 'axios';

export function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; erro?: string; message?: string }
      | undefined;

    return (
      data?.error ||
      data?.erro ||
      data?.message ||
      error.message ||
      'Ocorreu um erro inesperado.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

export default extrairMensagemErro;
