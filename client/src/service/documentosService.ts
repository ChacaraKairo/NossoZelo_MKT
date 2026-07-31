import api, { extrairErroApi } from '@/service/api';

export type DocumentoVerificacao = {
  id: number;
  tipo_documento: string;
  tipoDocumento?: string;
  tipoDocumentoNome?: string | null;
  status: string;
  provedor?: string | null;
  score?: string | number | null;
  motivo_recusa?: string | null;
  analise?: {
    sinal: string;
    score?: string | number | null;
    status: string;
    precisa_revisao: boolean;
    motivo?: string | null;
    pendencias?: unknown;
    criado_em: string;
  } | null;
  criado_em: string;
  atualizado_em: string;
};

export type TipoDocumentoCatalogo = {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string | null;
  categoria: string;
  obrigatorio_busca: boolean;
  exige_revisao_manual: boolean;
  permite_pdf: boolean;
  permite_imagem: boolean;
  tamanho_maximo_mb: number;
  validade_dias?: number | null;
  nivel_risco: string;
  campos_esperados?: unknown;
  regras_validacao?: unknown;
};

export type StatusDocumental = {
  id: string;
  documentos_status: string;
  identidade_status?: string | null;
  profissional_status?: string | null;
  documentos_revisado_em?: string | null;
  podeAparecerNaBusca: boolean;
  tiposDocumentos?: TipoDocumentoCatalogo[];
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
    const response = await api.post('/documentos/analisar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(extrairErroApi(error).mensagem);
  }
}
