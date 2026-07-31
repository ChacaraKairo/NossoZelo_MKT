export type VerifyDocumentInput = {
  usuarioId: string;
  documentoId: number;
  tipoDocumento: string;
  arquivoChave: string;
  mimeType?: string;
};

export type VerifyDocumentResult = {
  provider: string;
  providerRequestId?: string;
  status: 'aprovado' | 'recusado' | 'pendente_revisao' | 'erro';
  score?: number;
  motivo?: string;
  dadosExtraidos?: Record<string, unknown>;
  resultadoResumo?: Record<string, unknown>;
};

export type VerifyIdentityInput = {
  usuarioId: string;
  documentoIds: number[];
  nomeInformado?: string;
  cpfInformado?: string;
  dataNascimentoInformada?: string;
  selfieDocumentoId?: number;
};

export type VerifyIdentityResult = {
  provider: string;
  providerRequestId?: string;
  status: 'aprovada' | 'divergente' | 'reprovada' | 'em_analise' | 'erro';
  scoreGeral?: number;
  cpfValidado?: boolean;
  nomeValidado?: boolean;
  nascimentoValidado?: boolean;
  documentoValidado?: boolean;
  faceMatchValidado?: boolean;
  livenessValidado?: boolean;
  motivo?: string;
  resultadoResumo?: Record<string, unknown>;
};

export interface DocumentVerificationProvider {
  name: string;
  verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentResult>;
  verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult>;
  getResult?(providerRequestId: string): Promise<VerifyIdentityResult | VerifyDocumentResult>;
}
