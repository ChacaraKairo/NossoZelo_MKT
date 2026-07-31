import { describe, expect, it } from 'vitest';
import {
  prestadorPodeAparecerNaBusca,
  sanitizeDocumentAuditPayload,
} from '../service/Service_Documentos';

describe('validacao documental', () => {
  it('libera prestador na busca apenas com identidade e documentos aprovados', () => {
    expect(
      prestadorPodeAparecerNaBusca({
        documentos_status: 'aprovado',
        identidade_status: 'aprovada',
        profissional_status: 'nao_aplicavel',
      }),
    ).toBe(true);

    expect(
      prestadorPodeAparecerNaBusca({
        documentos_status: 'pendente_revisao',
        identidade_status: 'aprovada',
        profissional_status: 'nao_aplicavel',
      }),
    ).toBe(false);

    expect(
      prestadorPodeAparecerNaBusca({
        documentos_status: 'aprovado',
        identidade_status: 'em_analise',
        profissional_status: 'nao_aplicavel',
      }),
    ).toBe(false);
  });

  it('remove dados sensiveis de payloads de auditoria', () => {
    expect(
      sanitizeDocumentAuditPayload({
        cpf: '12345678900',
        resultado: {
          score: 91,
          cnh: '123456789',
        },
      }),
    ).toEqual({
      cpf: '[REDACTED]',
      resultado: {
        score: 91,
        cnh: '[REDACTED]',
      },
    });
  });
});
