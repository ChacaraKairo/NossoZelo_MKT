# Deploy

Checklist tecnico para promover uma versao do NossoZelo.

## Antes do deploy

1. Confirmar migrations revisadas em `server/prisma/migrations` e `controlador/prisma/migrations`.
2. Rodar validacoes locais:

```bash
cd server && npm test && npm run build
cd client && npm run lint && npm run build
cd controlador && npm run lint && npm run build
```

3. Confirmar variaveis:

```env
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
BACKEND_PUBLIC_URL=
PAYMENT_GATEWAY=asaas
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_BILLING_TYPE=PIX
```

4. Confirmar webhook no Asaas:

```text
https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas
https://SEU_CONTROLADOR/api/webhooks/asaas
```

## Ordem segura

1. Fazer backup do banco.
2. Aplicar migrations.
3. Publicar `server`.
4. Publicar `controlador`.
5. Publicar `client`.
6. Executar health check.
7. Gerar uma cobranca em sandbox ou conta de homologacao.
8. Simular webhook de pagamento confirmado e atraso.

## Health check

Use:

```text
GET /health
GET /nossozelo/health
```

Ambos precisam responder sem depender de sessao.

## Pos-deploy

- Verificar logs de webhook sem payload sensivel.
- Verificar que `eventos_assinatura` recebeu eventos novos.
- Verificar que planos inativos nao aparecem no marketplace.
- Verificar que prestador inadimplente nao aparece na busca.
- Verificar cron dos jobs.
# Deploy

Antes de publicar:

- `JWT_SECRET` forte, unico por ambiente.
- `ALLOWED_ORIGINS` definido, sem wildcard.
- HTTPS ativo para client, controlador e API.
- Cookies de sessao validados em ambiente com dominio real.
- Buckets S3 separados para publico e privado.
- Webhook Asaas configurado com `ASAAS_WEBHOOK_TOKEN`.
- `npx prisma migrate deploy` executado no banco de producao.

Comandos de validacao:

```bash
cd server && npm test && npm run build
cd client && npm run lint && npm run build
cd controlador && npm run prisma:generate && npm test && npm run lint && npm run build
docker compose config
```

