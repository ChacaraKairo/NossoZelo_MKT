# Assinatura mensal de prestadores com Asaas

Prestadores dos tipos cuidador, enfermeiro e acompanhante precisam ter uma assinatura mensal ativa para operar profissionalmente na NossoZelo. Clientes comuns continuam com cadastro gratuito.

Sem assinatura ativa, o prestador pode acessar o site, perfil e financeiro, mas fica profissionalmente inativo: nao aparece na busca, nao recebe pedidos e ve alertas no perfil e na aba Financeiro.

## Valor real da assinatura

O valor cobrado precisa vir de um plano real no banco ou de `ASSINATURA_VALOR`.
Nao deixe `ASSINATURA_VALOR` como `0.01` fora de um teste isolado de sandbox.

```env
PAYMENT_GATEWAY="asaas"
ASSINATURA_VALOR=""
ASAAS_BASE_URL="https://api.asaas.com/v3"
ASAAS_BILLING_TYPE="PIX"
```

Em producao, use a URL oficial do Asaas e uma chave `ASAAS_API_KEY` de producao. Em sandbox, use apenas dados de homologacao.

## Status

Assinatura:

- `pendente`
- `aguardando_confirmacao`
- `ativa`
- `atrasada`
- `bloqueada`
- `cancelada`
- `falhou`
- `expirada`

Cadastro do usuario:

- `ativo`
- `pendente_pagamento`
- `aguardando_confirmacao_pagamento`
- `inadimplente`
- `bloqueado`
- `cancelado`

Somente `usuarios.status_cadastro = ativo` com `assinaturas.status = ativa` libera busca, pedidos e perfil profissional ativo.

## Fluxo com Asaas

1. Prestador confirma e-mail.
2. Prestador inicia ou regulariza a assinatura.
3. Backend cria cliente no Asaas.
4. Backend cria assinatura mensal no Asaas.
5. Assinatura local fica `aguardando_confirmacao`.
6. Asaas envia webhook real de pagamento.
7. Backend valida o token do webhook.
8. Backend atualiza assinatura e `usuarios.status_cadastro` somente quando o `subscription` do Asaas bater com `gateway_subscription_id`.
9. Prestador passa a aparecer na busca quando a assinatura ficar `ativa`.

## Webhook

Cadastre no Asaas:

```text
https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas
https://SEU_CONTROLADOR/api/webhooks/asaas
```

O token configurado no painel do Asaas precisa ser igual ao valor de:

```env
ASAAS_WEBHOOK_TOKEN=""
```

## Confirmacao em ate 72 horas

Quando o pagamento fica pendente, a assinatura entra em `aguardando_confirmacao` e recebe `confirmacao_expira_em` com 72 horas a partir da tentativa.

Durante esse prazo, o prestador continua acessando o site, mas nao aparece nas buscas, nao recebe pedidos e segue com perfil profissional inativo.

Se o prazo expirar, `Service_Assinatura.expirarAssinaturasSemConfirmacao` marca como `expirada`.

## Rotinas operacionais

Execute em rotina agendada:

```bash
npm run assinaturas:verificar
npm run assinaturas:expirar-pendentes
npm run tokens:limpar
```

O webhook e a verificacao local trabalham juntos para bloquear, expirar e reativar prestadores conforme o estado financeiro.
