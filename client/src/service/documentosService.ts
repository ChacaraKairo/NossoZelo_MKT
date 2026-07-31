import api, { extrairErroApi } from '@/service/api';

export type DocumentoVerificacao = {
  id: number;
  tipo_documento: string;
  status: string;
  provedor?: string | null;
  score?: string | number | null;
  motivo_recusa?: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type StatusDocumental = {
  id: string;
  documentos_status: string;
  identidade_status?: string | null;
  profissional_status?: string | null;
  documentos_revisado_em?: string | null;
  podeAparecerNaBusca: boolean;
  documentos: DocumentoVerificacao[];
};

export async function obterStatusDocumental() {
  try {
    const response = await api.get<StatusDocumental>('/documentos/status');
    return response.data;
  } catch (error) {
    throw new Error(extrairErroApi(error).mensagem);
  }
}

export async function enviarDocumentoVerificacao(
  tipoDocumento: string,
  arquivo: File,
) {
  const formData = new FormData();
  formData.append('tipo_documento', tipoDocumento);
  formData.append('arquivo', arquivo);

  try {
    const response = await api.post('/documentos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(extrairErroApi(error).mensagem);
  }
}
