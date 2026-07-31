import {
  DocumentVerificationProvider,
  VerifyDocumentInput,
  VerifyDocumentResult,
  VerifyIdentityInput,
  VerifyIdentityResult,
} from './DocumentVerificationProvider';

export class ManualDocumentVerificationProvider implements DocumentVerificationProvider {
  name = 'manual';

  async verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentResult> {
    return {
      provider: this.name,
      status: 'pendente_revisao',
      score: 0,
      motivo: 'Documento aguardando revisao manual.',
      resultadoResumo: {
        tipoDocumento: input.tipoDocumento,
        validacao: 'manual',
      },
    };
  }

  async verifyIdentity(_input: VerifyIdentityInput): Promise<VerifyIdentityResult> {
    return {
      provider: this.name,
      status: 'em_analise',
      scoreGeral: 0,
      motivo: 'Identidade aguardando revisao manual.',
      resultadoResumo: { validacao: 'manual' },
    };
  }
}
