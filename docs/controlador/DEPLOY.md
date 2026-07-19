# Controlador - deploy

## Build

```bash
cd controlador
npm ci
npm run lint
npm test
npm run build
```

## Variaveis obrigatorias

```env
NODE_ENV=production
DATABASE_URL=mysql://...
JWT_ADMIN_SECRET=...
MASTER_ADMIN_EMAIL=...
CRON_SECRET=...
CONTROLADOR_PUBLIC_URL=https://admin.seudominio.com
ASAAS_ENVIRONMENT=production
ASAAS_API_KEY=...
ASAAS_WEBHOOK_TOKEN=...
ASAAS_BASE_URL=https://api.asaas.com/v3
```

## Variaveis opcionais

```env
PORT=3001
NEXT_PUBLIC_APP_NAME=Controlador NossoZelo
ADMIN_ALLOWED_ORIGINS=
PAYMENT_GATEWAY=asaas
ASSINATURA_VALOR=
ASAAS_BILLING_TYPE=PIX
```

## Passos recomendados

1. Gerar segredo forte para `JWT_ADMIN_SECRET`.
2. Gerar segredo forte para `CRON_SECRET`.
3. Configurar `MASTER_ADMIN_EMAIL`.
4. Configurar `CONTROLADOR_PUBLIC_URL` com HTTPS.
5. Configurar banco de producao em `DATABASE_URL`.
6. Rodar migrations no backend antes do deploy.
7. Rodar `npx prisma generate` no controlador durante build.
8. Configurar webhook Asaas:

```text
https://SEU_CONTROLADOR/api/webhooks/asaas
```

9. Configurar cron:

```text
GET /api/assinaturas/sincronizar
Authorization: Bearer <CRON_SECRET>
```

10. Validar login admin em dominio real.
11. Validar que mutacao externa recebe `403`.
12. Validar que API sem sessao recebe `401`.
13. Validar que paginas sem sessao redirecionam para `/login`.

## Vercel

O arquivo `controlador/vercel.json` define:

- framework Next.js;
- build command `npm run build`;
- output `.next`;
- cron diario para `/api/assinaturas/sincronizar`.

Se o provedor de cron nao enviar `Authorization: Bearer <CRON_SECRET>`, configure o cron fora da Vercel ou ajuste a autenticacao conforme suporte do provedor.

## Pos-deploy

- Acessar `/login`.
- Fazer login com admin mestre.
- Acessar `/dashboard`.
- Abrir `/api/auth/me` autenticado.
- Validar listagem de usuarios.
- Criar ou editar um plano de teste em ambiente de homologacao.
- Conferir `logs_acao`.
- Testar webhook Asaas sandbox antes de producao.

## Rollback

1. Voltar para a versao anterior no provedor.
2. Confirmar se migrations novas foram aplicadas.
3. Se houve migration sensivel, seguir `docs/operacao/backup-restore.md`.
4. Conferir health check e login admin.
