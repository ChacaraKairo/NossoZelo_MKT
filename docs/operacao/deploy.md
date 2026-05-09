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
NODE_ENV=production
DATABASE_URL=
JWT_SECRET=
ALLOWED_ORIGINS=
FRONTEND_URL=
BACKEND_PUBLIC_URL=
RATE_LIMIT_STORE=upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
PAYMENT_GATEWAY=asaas
ASAAS_ENVIRONMENT=production
ASAAS_API_KEY=
ASAAS_WEBHOOK_TOKEN=
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_TIMEOUT_MS=60000
ENABLE_UPLOADS=true
UPLOAD_SCAN_MODE=clamav
CLAMAV_HOST=
CLAMAV_PORT=3310
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_PUBLIC_BUCKET_NAME=
AWS_PRIVATE_BUCKET_NAME=
```

4. Confirmar webhook no Asaas:

```text
https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas
https://SEU_CONTROLADOR/api/webhooks/asaas
```

## Ordem segura

1. Fazer backup do banco.
2. Aplicar migrations com `npx prisma migrate deploy`.
3. Publicar `server`.
4. Publicar `controlador`.
5. Publicar `client`.
6. Executar health check.
7. Testar rate limit distribuido.
8. Validar ClamAV com arquivo limpo e EICAR em staging.
9. Gerar assinatura em sandbox/homologacao.
10. Simular webhook de pagamento confirmado e atraso.

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
- Verificar que `ENABLE_ADMIN_CRUD=false`.
- Verificar termos e politica de privacidade publicados.
