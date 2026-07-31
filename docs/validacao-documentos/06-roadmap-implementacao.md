# API de Validação de Documentos — Roadmap de Implementação

## Objetivo

Orientar a implementação da API de validação documental em etapas seguras, sem bloquear o MVP do marketplace e sem criar automação arriscada cedo demais.

## Fase 1 — Documentação e revisão manual estruturada

Prioridade: P0

### Backend

- Criar campos de status documental no usuário/prestador.
- Criar tabela `documentos_verificacao`.
- Criar tabela `revisoes_documentos`.
- Criar endpoint de upload.
- Criar endpoint de status documental.
- Criar listagem de documentos do usuário autenticado.
- Criar regra central `prestadorPodeAparecerNaBusca`.
- Bloquear prestador na busca quando documentação não estiver aprovada.
- Registrar auditoria para upload, aprovação e recusa.

### Controlador

- Criar tela de documentos pendentes.
- Criar tela de detalhe do documento.
- Criar ação de aprovar.
- Criar ação de recusar.
- Criar ação de solicitar reenvio.
- Exigir motivo para decisão manual.

### Segurança

- Garantir que documento privado não tenha URL pública.
- Manter `ENABLE_UPLOADS=false` em produção até storage/scanner estarem prontos.
- Sanitizar logs.
- Auditar decisões administrativas.

### Critério de pronto

```text
Prestador sem documentos aprovados não aparece na busca.
Admin consegue aprovar/recusar documentos no controlador.
Todas as ações principais são auditadas.
```

## Fase 2 — Provider mock e testes

Prioridade: P0/P1

- Criar interface `DocumentVerificationProvider`.
- Criar provider `manual`.
- Criar provider `mock`.
- Criar testes automatizados para status aprovado, recusado, pendente e erro.
- Criar testes de elegibilidade do prestador.
- Criar testes de permissão administrativa.

### Critério de pronto

```text
Testes simulam validação documental sem depender de API externa.
```

## Fase 3 — Integração com API externa

Prioridade: P1

- Escolher provedor externo.
- Configurar variáveis de ambiente.
- Implementar provider real.
- Salvar provider_request_id.
- Salvar score e resumo sanitizado.
- Implementar webhook, se necessário.
- Implementar idempotência.
- Criar fallback para revisão manual.

### Critério de pronto

```text
Sistema consegue enviar documento ao provider e receber resultado sem expor dados sensíveis.
```

## Fase 4 — Selfie e prova de vida

Prioridade: P1/P2

- Criar tipo de documento `selfie`.
- Criar fluxo de envio de selfie.
- Integrar comparação facial se provider suportar.
- Integrar prova de vida se provider suportar.
- Aplicar regra de revisão manual em casos duvidosos.

### Critério de pronto

```text
Sistema valida que quem enviou o documento é compatível com a pessoa da selfie.
```

## Fase 5 — Validação profissional

Prioridade: P1/P2

- Criar fluxo específico para enfermeiro.
- Exigir COREN e documento profissional.
- Criar status profissional separado.
- Permitir revisão manual pelo controlador.
- Preparar integração futura com consulta profissional externa, se disponível.

### Critério de pronto

```text
Enfermeiros só aparecem na busca após identidade e validação profissional aprovadas.
```

## Ordem recomendada de issues/PRs

```text
1. docs: documenta api de validacao documental
2. feat: adiciona modelo de dados de documentos
3. feat: adiciona upload e status documental
4. feat: adiciona revisao documental no controlador
5. feat: bloqueia busca por documentacao pendente
6. test: adiciona testes de elegibilidade documental
7. feat: adiciona provider mock de validacao documental
8. feat: integra provider externo de validacao documental
```

## O que não fazer agora

- Não aprovar automaticamente todos os documentos.
- Não salvar documento em base64 no banco.
- Não liberar documento por URL pública.
- Não depender de provider externo para lançar a fase manual.
- Não misturar status de assinatura com status documental.
- Não misturar identidade com validação profissional.

## Entrega mínima aceitável

A primeira entrega útil é:

```text
upload privado + status documental + revisão manual + bloqueio na busca + auditoria
```

Essa entrega já aumenta bastante a segurança operacional do marketplace.
