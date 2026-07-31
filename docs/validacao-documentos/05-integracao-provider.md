# API de Validação de Documentos — Integração com Provider Externo

## Objetivo

Preparar o backend para integrar serviços externos de KYC, documentoscopia, OCR, comparação facial e prova de vida sem acoplar o código a um único fornecedor.

A primeira versão pode funcionar sem provider externo, usando revisão manual. A arquitetura, porém, deve permitir ativar provider futuramente.

## Interface principal

Criar uma interface genérica:

```ts
export interface DocumentVerificationProvider {
  name: string;

  verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentResult>;

  verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityResult>;

  getResult?(providerRequestId: string): Promise<VerifyIdentityResult | VerifyDocumentResult>;
}
```

## Tipos de entrada

```ts
export type VerifyDocumentInput = {
  usuarioId: string;
  documentoId: number;
  tipoDocumento: string;
  arquivoChave: string;
  mimeType?: string;
};

export type VerifyIdentityInput = {
  usuarioId: string;
  documentoIds: number[];
  nomeInformado?: string;
  cpfInformado?: string;
  dataNascimentoInformada?: string;
  selfieDocumentoId?: number;
};
```

## Tipos de resultado

```ts
export type VerifyDocumentResult = {
  provider: string;
  providerRequestId?: string;
  status: "aprovado" | "recusado" | "pendente_revisao" | "erro";
  score?: number;
  motivo?: string;
  dadosExtraidos?: Record<string, unknown>;
  resultadoResumo?: Record<string, unknown>;
};

export type VerifyIdentityResult = {
  provider: string;
  providerRequestId?: string;
  status: "aprovada" | "divergente" | "reprovada" | "em_analise" | "erro";
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
```

## Providers previstos

A implementação deve permitir providers como:

```text
manual
mock
serpro_datavalid
idwall
unico
caf
outro
```

Para o MVP, usar:

```text
DOCUMENT_VERIFICATION_PROVIDER=manual
```

ou

```text
DOCUMENT_VERIFICATION_PROVIDER=mock
```

## Variáveis de ambiente sugeridas

```env
DOCUMENT_VERIFICATION_PROVIDER=manual
DOCUMENT_VERIFICATION_ENABLED=false
DOCUMENT_VERIFICATION_AUTO_APPROVE=false
DOCUMENT_VERIFICATION_MIN_SCORE_APPROVE=85
DOCUMENT_VERIFICATION_MIN_SCORE_REVIEW=60
DOCUMENT_VERIFICATION_WEBHOOK_SECRET=
```

Quando provider externo estiver ativo:

```env
DOCUMENT_PROVIDER_API_URL=
DOCUMENT_PROVIDER_API_KEY=
DOCUMENT_PROVIDER_WEBHOOK_SECRET=
```

Nunca versionar chaves reais.

## Provider manual

O provider manual não chama API externa.

Ele apenas classifica documentos como:

```text
pendente_revisao
```

Esse comportamento permite lançar a fase 1 com segurança operacional.

## Provider mock

O provider mock deve ser usado em testes automatizados.

Deve permitir simular:

```text
aprovado
pendente_revisao
recusado
erro
```

## Provider externo

O provider externo deve:

- receber arquivo por URL temporária segura ou upload conforme contrato do fornecedor;
- retornar request id;
- retornar score;
- retornar resultado resumido;
- nunca expor token em log;
- nunca salvar payload completo sem sanitização;
- suportar idempotência.

## Classificação por score

Regra padrão:

```text
score >= 85 -> aprovado
score >= 60 e < 85 -> pendente_revisao
score < 60 -> recusado
```

A regra pode ser mais rígida para enfermeiros e documentos profissionais.

## Webhook do provider

Se o provider operar de forma assíncrona, criar endpoint:

```http
POST /nossozelo/documentos/webhook/:provider
```

Regras:

- validar assinatura;
- validar timestamp, se disponível;
- aplicar idempotência;
- atualizar documento/verificação;
- auditar resultado;
- não logar payload completo.

## Idempotência

Criar controle por:

```text
provider
provider_event_id
provider_request_id
payload_hash
```

Evitar processar o mesmo evento duas vezes.

## Fallback operacional

Se o provider externo falhar:

- documento não deve ser aprovado automaticamente;
- status deve virar `pendente_revisao` ou `em_validacao`, conforme tipo de erro;
- admin deve conseguir revisar manualmente;
- erro deve ser registrado sem dados sensíveis.

## Decisão de lançamento

No primeiro ciclo, a recomendação é:

```text
DOCUMENT_VERIFICATION_PROVIDER=manual
DOCUMENT_VERIFICATION_ENABLED=true
DOCUMENT_VERIFICATION_AUTO_APPROVE=false
```

Assim o marketplace já bloqueia prestadores sem documento aprovado, mas evita risco de aprovação automática incorreta.
