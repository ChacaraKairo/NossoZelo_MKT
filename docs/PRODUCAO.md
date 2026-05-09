# Producao

Este projeto esta mais proximo de um MVP operavel, mas producao exige que os itens abaixo estejam configurados e testados em staging antes do lancamento publico.

## Variaveis criticas

Backend em producao nao deve iniciar sem:

- `JWT_SECRET`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `BACKEND_PUBLIC_URL`
- `RATE_LIMIT_STORE=upstash`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ASAAS_ENVIRONMENT=production`, `ASAAS_API_KEY` e `ASAAS_BASE_URL=https://api.asaas.com/v3`, se `PAYMENT_GATEWAY=asaas`
- Variaveis AWS e `UPLOAD_SCAN_MODE=clamav`, se `ENABLE_UPLOADS=true`

Frontend publico em producao precisa de:

- `NEXT_PUBLIC_API_URL` apontando para a URL publica HTTPS do backend

Controlador/admin em producao precisa de:

- `DATABASE_URL`
- `JWT_ADMIN_SECRET` com pelo menos 32 caracteres
- `MASTER_ADMIN_EMAIL`
- `CRON_SECRET` com pelo menos 32 caracteres, se usar sincronizacao automatica
- `ASAAS_ENVIRONMENT`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN` e `ASAAS_BASE_URL`

Use HTTPS para frontend e backend. Se estiverem em dominios diferentes, confirme que `FRONTEND_URL` e `BACKEND_PUBLIC_URL` estao corretos; o cookie sera `SameSite=None; Secure` automaticamente. Para forcar, configure `COOKIE_SAMESITE=none`.

## Deploy sugerido

- Backend: Render, Fly.io, Railway ou container em cloud.
- Frontend: Vercel ou container estatico/Next server.
- Banco: MySQL gerenciado.
- Rate limit: Upstash Redis REST ou Redis compativel via adaptador equivalente.
- Arquivos: S3 com bucket publico apenas para fotos e bucket privado para documentos.
- Scanner: ClamAV/clamd acessivel pelo backend.

## Checklist

- Rodar `npm run lint`, `npm test` e `npm run build` em `server/`.
- Rodar `npm run lint` e `npm run build` em `client/`.
- Rodar `npx prisma migrate deploy` antes do start.
- Rodar `npx prisma db seed` em ambiente novo.
- Configurar `ALLOWED_ORIGINS` sem wildcard.
- Configurar webhooks do Asaas com token forte.
- Revisar `ENABLE_ADMIN_CRUD`; mantenha `false` em producao salvo janela controlada.
- Validar ClamAV com arquivo limpo e arquivo EICAR em staging.
- Validar bloqueio de rate limit em staging.

## Pendencias antes de producao publica

- Fazer revisao completa de autorizacao por recurso em agendamentos, assinatura, perfil e admin.
- Criar testes E2E reais de login, onboarding, assinatura e agendamento.
- Refatorar `server/src/src` em mudanca dedicada.
- Corrigir encoding legado dos enums `agenda_recorrente_dia_semana` com migration planejada.
- Adicionar observabilidade, tracing, metricas e alertas.
- Formalizar termos, privacidade, retencao de documentos, suporte, denuncia, disputa e cancelamento.
