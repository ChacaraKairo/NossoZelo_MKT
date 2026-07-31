# API de Validação de Documentos — Endpoints

## Convenções

Base pública/autenticada do backend:

```text
/nossozelo/documentos
```

Base administrativa no controlador:

```text
/controlador/documentos
```

Todos os endpoints de usuário devem exigir autenticação.
Todos os endpoints administrativos devem exigir admin autenticado.

Implementado nesta fase como MVP manual:

```http
POST /nossozelo/documentos/upload
POST /nossozelo/documentos/analisar
GET /nossozelo/documentos/status
POST /nossozelo/documentos/:id/reprocessar
POST /nossozelo/documentos/:id/reanalisar
GET /nossozelo/documentos/:id/analise
GET /nossozelo/documentos/admin/pendentes
GET /nossozelo/documentos/admin/:id
POST /nossozelo/documentos/admin/:id/aprovar
POST /nossozelo/documentos/admin/:id/recusar
```

No controlador administrativo tambem existem rotas internas:

```http
GET /api/documentos/pendentes
GET /api/documentos/:id
POST /api/documentos/:id/aprovar
POST /api/documentos/:id/recusar
```

O front publico de prestador usa `/prestador/documentos`, e o painel administrativo usa `/documentos`.

## Endpoints do prestador

### Upload de documento

```http
POST /nossozelo/documentos/upload
```

Alias com esteira de análise:

```http
POST /nossozelo/documentos/analisar
```

Nesta fase, `/analisar` salva o arquivo, cria `documentos_verificacao`, registra `documentos_analises` e retorna sinal/score. Sem OCR/provider externo configurado, o sinal esperado é `amarelo`, com revisão manual obrigatória.

Tipo:

```text
multipart/form-data
```

Campos:

```text
tipo_documento
arquivo
```

Exemplo de resposta:

```json
{
  "documentoId": 123,
  "tipoDocumento": "identidade_frente",
  "status": "enviado",
  "sinal": "amarelo",
  "score": 70,
  "precisaRevisaoManual": true,
  "message": "Documento recebido para validação."
}
```

Validações obrigatórias:

- usuário autenticado;
- arquivo presente;
- tipo de documento permitido;
- MIME permitido;
- extensão permitida;
- tamanho máximo;
- assinatura binária compatível;
- scanner ativo quando `ENABLE_UPLOADS=true` e ambiente produção;
- storage configurado.

---

### Listar meus documentos

```http
GET /nossozelo/documentos/meus
```

Resposta:

```json
{
  "documentos": [
    {
      "id": 123,
      "tipoDocumento": "identidade_frente",
      "status": "pendente_revisao",
      "criadoEm": "2026-07-31T10:00:00.000Z",
      "atualizadoEm": "2026-07-31T10:05:00.000Z"
    }
  ]
}
```

Não retornar URL pública do arquivo.

---

### Consultar status documental

```http
GET /nossozelo/documentos/status
```

Resposta:

```json
{
  "documentosStatus": "pendente_revisao",
  "identidadeStatus": "em_analise",
  "profissionalStatus": "pendente",
  "podeAparecerNaBusca": false,
  "pendencias": [
    "Aguardando revisão do documento profissional."
  ]
}
```

---

### Iniciar validação automática

```http
POST /nossozelo/documentos/:id/verificar
```

Endpoint implementado para reanálise:

```http
POST /nossozelo/documentos/:id/reanalisar
GET /nossozelo/documentos/:id/analise
```

Uso:

- pode ser chamado automaticamente após upload;
- pode ser reprocessado manualmente por admin;
- deve respeitar rate limit.

Resposta:

```json
{
  "documentoId": 123,
  "status": "em_validacao",
  "providerRequestId": "req_abc123"
}
```

---

## Endpoints administrativos no controlador

### Listar documentos pendentes

```http
GET /controlador/documentos/pendentes
```

Filtros:

```text
status
usuario_id
tipo_documento
tipo_prestador
inicio
fim
```

Resposta:

```json
{
  "data": [
    {
      "documentoId": 123,
      "usuarioId": "usr_123",
      "nome": "Prestador Exemplo",
      "tipoPrestador": "enfermeiro",
      "tipoDocumento": "coren",
      "status": "pendente_revisao",
      "score": 72.5,
      "criadoEm": "2026-07-31T10:00:00.000Z"
    }
  ]
}
```

---

### Detalhar documento

```http
GET /controlador/documentos/:id
```

Deve retornar:

- metadados;
- status;
- resultado resumido;
- dados extraídos sanitizados;
- histórico de revisão;
- link temporário seguro para visualização, se implementado.

Nunca retornar arquivo público permanente.

---

### Aprovar documento

```http
POST /controlador/documentos/:id/aprovar
```

Body:

```json
{
  "motivo": "Documento conferido manualmente e compatível com o cadastro."
}
```

Efeitos:

- atualiza documento para `aprovado`;
- registra revisão;
- atualiza status consolidado do usuário quando aplicável;
- audita a ação.

---

### Recusar documento

```http
POST /controlador/documentos/:id/recusar
```

Body:

```json
{
  "motivo": "Documento ilegível. Solicitar novo envio."
}
```

Efeitos:

- atualiza documento para `recusado`;
- registra motivo;
- atualiza status consolidado do usuário;
- impede liberação na busca;
- audita a ação.

---

### Solicitar novo envio

```http
POST /controlador/documentos/:id/solicitar-reenvio
```

Body:

```json
{
  "motivo": "Imagem cortada. Envie novamente frente e verso do documento."
}
```

Efeitos:

- atualiza status para `recusado` ou `pendente_reenvio`, se esse status for criado;
- notifica usuário, quando o sistema de e-mail estiver ativo;
- audita a ação.

---

### Reprocessar validação

```http
POST /controlador/documentos/:id/reprocessar
```

Uso:

- falha temporária do provedor;
- troca de regra;
- revisão operacional.

Efeitos:

- cria nova tentativa;
- preserva histórico anterior;
- audita reprocessamento.

## Endpoints internos do provider

Caso o provedor externo use webhook:

```http
POST /nossozelo/documentos/webhook/:provider
```

Requisitos:

- assinatura/token forte;
- idempotência por evento externo;
- não logar payload bruto completo;
- salvar resumo sanitizado;
- auditar resultado.

## Códigos de erro sugeridos

```text
DOCUMENTO_NAO_ENCONTRADO
DOCUMENTO_TIPO_INVALIDO
DOCUMENTO_ARQUIVO_INVALIDO
DOCUMENTO_TAMANHO_EXCEDIDO
DOCUMENTO_UPLOADS_DESABILITADOS
DOCUMENTO_SCAN_REPROVADO
DOCUMENTO_PROVIDER_INDISPONIVEL
DOCUMENTO_PROVIDER_ERRO
DOCUMENTO_REVISAO_NAO_AUTORIZADA
DOCUMENTO_STATUS_INVALIDO
```

## Permissões

Prestador:

```text
documentos:upload
documentos:read_own
documentos:verify_own
```

Admin/controlador:

```text
documentos:read_all
documentos:approve
documentos:reject
documentos:reprocess
documentos:view_private_file
```

## Regras de resposta

Não retornar:

- token do provedor;
- CPF completo em listagem administrativa;
- URL pública permanente;
- base64 do arquivo;
- payload bruto do provider.

Retornar apenas o necessário para decisão operacional.
