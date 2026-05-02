# Produção

Este projeto foi aproximado de um MVP real, mas ainda não está pronto para produção sem as pendências abaixo.

## Variáveis Críticas

Backend em produção não deve iniciar sem:

- `JWT_SECRET`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `BACKEND_PUBLIC_URL`
- `ASAAS_API_KEY`, se `PAYMENT_GATEWAY=asaas`
- Variáveis AWS, se `ENABLE_UPLOADS=true`

Use HTTPS para frontend e backend. Se estiverem em domínios diferentes, use `COOKIE_SAMESITE=none`.

## Deploy Sugerido

- Backend: Render, Fly.io, Railway ou container em cloud.
- Frontend: Vercel ou container estático/Next server.
- Banco: MySQL gerenciado.
- Arquivos: S3 com bucket público apenas para fotos e bucket privado para documentos.

## Checklist

- Rodar `npm run lint`, `npm test` e `npm run build` em `server/`.
- Rodar `npm run lint` e `npm run build` em `client/`.
- Rodar `npx prisma migrate deploy` antes do start.
- Rodar `npx prisma db seed` em ambiente novo.
- Configurar `ALLOWED_ORIGINS` sem wildcard.
- Configurar webhooks do Asaas com token forte.
- Revisar `ENABLE_ADMIN_CRUD`; mantenha `false` em produção salvo janela controlada.

## Pendências Antes De Produção

- Substituir rate limit em memória por Redis.
- Adicionar antivírus/quarentena nos uploads.
- Fazer revisão completa de autorização por recurso em agendamentos e assinatura.
- Criar testes e2e reais de login, onboarding, assinatura e agendamento.
- Refatorar `server/src/src` em mudança dedicada.
- Corrigir encoding legado dos enums `agenda_recorrente_dia_semana` com migração planejada.
- Adicionar observabilidade, tracing e alertas.
