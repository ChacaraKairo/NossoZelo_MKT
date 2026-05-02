# Checklist de producao NossoZelo

Use este checklist antes de publicar uma nova versao.

## Banco e migrations

1. Confirmar `DATABASE_URL` do ambiente correto.
2. Rodar migrations:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

3. Gerar Prisma no controlador, quando ele usar o mesmo schema:

```bash
cd controlador
npx prisma generate
```

4. Validar que `eventos_assinatura` existe e possui `payload_hash` e `processado_em`.

## Jobs agendados

Configure cron, Render Cron Jobs, PM2 cron ou agendador equivalente:

```bash
cd server && npm run assinaturas:verificar
cd server && npm run assinaturas:expirar-pendentes
cd server && npm run tokens:limpar
```

Os scripts registram resumo no log e retornam exit code diferente de zero em falhas.

## Backup e restore

Backup manual:

```bash
cd server
npm run db:backup
```

Restore manual:

```bash
cd server
npm run db:restore
```

Antes de restaurar em producao, tire um backup novo, confirme o arquivo de origem e valide se a aplicacao esta parada ou em janela controlada.

## Health check

O backend possui health check em:

```text
GET /health
GET /nossozelo/health
```

O monitoramento externo deve alertar quando esses endpoints deixarem de responder.

## Variaveis criticas

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `BACKEND_PUBLIC_URL`
- `PAYMENT_GATEWAY=asaas`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_BASE_URL`
- `ASAAS_BILLING_TYPE`

Nunca publique logs contendo senha, token, CPF completo, cartao, CVV ou headers sensiveis.

## Validacoes antes do deploy

```bash
cd server && npm test && npm run build
cd client && npm run lint && npm run build
cd controlador && npm run lint && npm run build
```

## Asaas

Webhook esperado:

```text
https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas
https://SEU_CONTROLADOR/api/webhooks/asaas
```

O token do painel Asaas deve bater com `ASAAS_WEBHOOK_TOKEN`.

