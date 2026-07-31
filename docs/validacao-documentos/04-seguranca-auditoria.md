# API de Validação de Documentos — Segurança e Auditoria

## Objetivo

Definir regras mínimas para proteger documentos, identidade dos usuários e decisões administrativas relacionadas à validação documental.

Documentos pessoais são dados sensíveis. O sistema deve tratar essa API como uma área crítica do NossoZelo.

## Segurança de arquivos

### Regras obrigatórias

- Não salvar documento em base64 no banco.
- Não retornar URL pública permanente de documento privado.
- Armazenar apenas chave interna do objeto no banco.
- Usar bucket privado para documentos pessoais.
- Usar bucket público apenas para fotos públicas permitidas, nunca para documentos.
- Validar MIME, extensão e assinatura binária.
- Limitar tamanho máximo por tipo de arquivo.
- Remover metadados sensíveis quando aplicável.
- Usar ClamAV quando uploads estiverem ativos em produção.
- Manter `ENABLE_UPLOADS=false` até storage e scanner estarem prontos.

## Sanitização

Criar função central:

```ts
export function sanitizeDocumentAuditPayload(input: unknown): unknown {
  // remove ou mascara campos sensíveis antes de logs e auditoria
}
```

Campos que devem ser mascarados:

```text
cpf
documento
numero_documento
rg
cnh
coren
senha
token
authorization
cookie
api_key
asaas_api_key
aws_secret_access_key
arquivo_base64
selfie_base64
payload_bruto
```

Valor sugerido:

```text
[REDACTED]
```

## Auditoria obrigatória

Toda ação documental deve gerar log de auditoria.

Eventos mínimos:

```text
documento_upload_iniciado
documento_upload_concluido
documento_upload_falhou
documento_scan_aprovado
documento_scan_reprovado
documento_validacao_iniciada
documento_validacao_concluida
documento_validacao_falhou
documento_aprovado_automaticamente
documento_enviado_para_revisao
documento_aprovado_admin
documento_recusado_admin
documento_reenvio_solicitado
documento_reprocessado
prestador_bloqueado_documentacao
prestador_liberado_busca
```

## Campos de auditoria recomendados

```text
usuario_id
admin_id
documento_id
acao
resultado
motivo
ip
user_agent
request_id
provider
provider_request_id
status_anterior
status_novo
dados_sanitizados
criado_em
```

## Dados proibidos na auditoria

Nunca registrar:

- arquivo em base64;
- selfie em base64;
- documento completo;
- CPF completo em log aberto;
- token do provedor;
- segredo de API;
- cookie completo;
- payload bruto sensível do provedor.

## Acesso administrativo

A visualização de documentos no controlador deve exigir permissão específica.

Permissões sugeridas:

```text
documentos:read_all
documentos:view_private_file
documentos:approve
documentos:reject
documentos:reprocess
```

Nem todo admin deve conseguir ver documento privado.

## Links temporários

Se for necessário visualizar arquivo no controlador, usar link temporário assinado.

Regras:

```text
- expiração curta, por exemplo 5 minutos;
- gerar apenas para admin autorizado;
- auditar geração do link;
- não salvar link temporário no banco;
- não expor link em logs.
```

## Logs de aplicação

Logs devem conter contexto operacional, mas não dados pessoais completos.

Exemplo correto:

```json
{
  "event": "documento_validacao_concluida",
  "documentoId": 123,
  "usuarioId": "usr_123",
  "status": "pendente_revisao",
  "score": 72.5,
  "requestId": "req_abc"
}
```

Exemplo incorreto:

```json
{
  "cpf": "12345678900",
  "documentoBase64": "...",
  "providerToken": "..."
}
```

## Integração com busca

Sempre que o status documental mudar, o backend deve recalcular a elegibilidade do prestador.

Eventos que exigem recálculo:

```text
documento aprovado
documento recusado
identidade aprovada
identidade reprovada
profissional aprovado
profissional recusado
assinatura ativada
assinatura atrasada
cadastro bloqueado
```

## Revisão manual

Toda aprovação ou recusa manual deve exigir motivo.

Não permitir aprovação sem motivo quando:

- score menor que 85;
- provedor marcou divergência;
- documento profissional foi validado manualmente;
- houve reprocessamento.

## Retenção e exclusão

A política final deve ser definida juridicamente, mas a arquitetura deve prever:

```text
- data de envio;
- data de validação;
- data de expiração;
- data de exclusão lógica;
- motivo de exclusão;
- auditoria da exclusão.
```

Não implementar exclusão definitiva automática sem política formal.
