# Pendencias para producao

Este documento consolida o que ainda falta para o NossoZelo sair de MVP controlado e ir para producao com mais seguranca operacional.

## Estado atual

O projeto ja possui uma boa base para MVP:

- Backend Express/TypeScript com Prisma e PostgreSQL.
- Frontend Next.js.
- Painel administrativo separado em `controlador/`.
- Autenticacao com cookie HttpOnly.
- CORS, Helmet, rate limit e logs basicos.
- Docker, seed, migrations e documentacao inicial.
- Testes unitarios/de integracao no backend.
- Fluxos principais de cadastro, login, onboarding, assinatura, busca, agendamento, cancelamento e avaliacao parcialmente estruturados.

Ainda nao deve ser considerado pronto para producao publica sem concluir os itens abaixo.

## Bloqueadores tecnicos

### 1. Fechar builds de producao

- [ ] `server`: manter `npm run lint`, `npm test` e `npm run build` passando.
- [ ] `client`: garantir `npm run lint` e `npm run build` passando com `NEXT_PUBLIC_API_URL` configurada.
- [ ] `controlador`: garantir `npm run lint` e `npm run build` passando.
- [ ] Rodar builds em ambiente limpo, sem depender de arquivos `.env` locais nao versionados.

Observacao: o build do client exige `NEXT_PUBLIC_API_URL` em ambiente de producao. Para teste local de build, use a URL local da API; para deploy, use a URL HTTPS real.

### 2. Sincronizar banco, Prisma e migrations

- [ ] Aplicar migrations em banco de homologacao.
- [ ] Rodar `npx prisma migrate deploy` no backend antes do start de producao.
- [ ] Gerar Prisma no backend e no controlador.
- [ ] Garantir que os schemas Prisma de `server/` e `controlador/` estejam alinhados nos campos compartilhados.
- [ ] Validar tabela `eventos_assinatura` com `payload_hash` e `processado_em`.
- [ ] Validar coluna `assinaturas.gateway_payment_id`.
- [ ] Validar indice `assinaturas_prestador_status_idx`.
- [ ] Executar ensaio de backup e restore antes de qualquer migracao sensivel.

### 3. Corrigir encoding legado dos enums

- [ ] Planejar migration para valores legados como `terÃƒÂ§a` e `sÃƒÂ¡bado`.
- [ ] Fazer backup antes da alteracao.
- [ ] Migrar dados antigos para valores corretos.
- [ ] Atualizar enum Prisma.
- [ ] Remover compatibilidade temporaria depois de validar staging.

Nao fazer esta etapa direto em producao sem staging e backup.

## Seguranca e hardening

### 4. Variaveis obrigatorias de producao

Backend:

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET` forte e exclusivo.
- [ ] `ALLOWED_ORIGINS` sem wildcard.
- [ ] `FRONTEND_URL`
- [ ] `BACKEND_PUBLIC_URL`
- [ ] `RATE_LIMIT_STORE=upstash`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`
- [ ] `PAYMENT_GATEWAY=asaas`, se pagamentos reais estiverem ativos.
- [ ] `ASAAS_ENVIRONMENT=production`
- [ ] `ASAAS_API_KEY`
- [ ] `ASAAS_WEBHOOK_TOKEN`
- [ ] `ASAAS_BASE_URL=https://api.asaas.com/v3`
- [ ] `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

Frontend:

- [ ] `NEXT_PUBLIC_API_URL` apontando para a API publica HTTPS.
- [ ] `NEXT_PUBLIC_API_TIMEOUT_MS`
- [ ] Flags publicas de login social revisadas.

Controlador:

- [ ] `DATABASE_URL`
- [ ] `JWT_ADMIN_SECRET` com pelo menos 32 caracteres.
- [ ] `MASTER_ADMIN_EMAIL`
- [ ] `CRON_SECRET` com pelo menos 32 caracteres.
- [ ] Variaveis Asaas iguais ao ambiente real usado.

### 5. Rate limit distribuido

- [ ] Configurar Upstash/Redis em producao.
- [ ] Bloquear start em producao quando `RATE_LIMIT_STORE` nao for `upstash`.
- [ ] Criar teste automatizado, ainda que mockado, para validar resposta 429.
- [ ] Testar limite real em staging.

### 6. Uploads seguros

- [ ] Manter `ENABLE_UPLOADS=false` ate a infraestrutura estar pronta.
- [ ] Configurar S3 com bucket publico apenas para fotos permitidas.
- [ ] Configurar bucket privado para documentos.
- [ ] Implementar quarentena antes de liberar arquivos.
- [ ] Configurar `UPLOAD_SCAN_MODE=clamav` em producao quando uploads estiverem ativos.
- [ ] Validar ClamAV com arquivo limpo e EICAR em staging.
- [ ] Registrar auditoria de upload, scan e liberacao.
- [ ] Garantir que documentos privados retornem chave interna, nao URL publica.
- [ ] Configurar storage privado definitivo para documentos em staging/producao.

### 7. CRUD administrativo

- [x] Garantir allowlist de entidades permitidas no CRUD generico.
- [x] Bloquear entidades sensiveis no service, nao apenas no controller.
- [x] Validar nomes de campos usados em busca dinamica.
- [ ] Avaliar troca de delete fisico por soft delete nas entidades administrativas.
- [ ] Criar testes especificos para entidade bloqueada, entidade inexistente e campo invalido.
- [ ] Manter `ENABLE_ADMIN_CRUD=false` em producao, salvo janela operacional controlada.

### 8. Validacao de entrada

- [ ] Adotar schemas por rota com Zod, Valibot ou Joi.
- [ ] Priorizar rotas de login, cadastro, recuperacao de senha, assinatura, webhook, upload e agendamento.
- [ ] Rejeitar campos inesperados em rotas sensiveis.
- [ ] Padronizar mensagens de erro para frontend e logs.

## Pagamentos e operacao financeira

### 9. Asaas

- [ ] Configurar webhook do backend:
  `https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas`
- [ ] Configurar webhook do controlador:
  `https://SEU_CONTROLADOR/api/webhooks/asaas`
- [ ] Confirmar token forte em `ASAAS_WEBHOOK_TOKEN`.
- [ ] Testar assinatura com cartao.
- [ ] Testar Pix.
- [ ] Testar boleto.
- [ ] Confirmar `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`.
- [ ] Confirmar ativacao local da assinatura.
- [ ] Confirmar que prestador ativo aparece na busca.
- [ ] Simular atraso e confirmar remocao da busca.
- [ ] Validar reprocessamento no controlador.
- [ ] Garantir idempotencia dos webhooks por evento/hash.

### 10. Jobs operacionais

- [ ] Configurar job no provedor para verificar assinaturas:
  `cd server && npm run assinaturas:verificar`
- [ ] Configurar job no provedor para expirar pendencias:
  `cd server && npm run assinaturas:expirar-pendentes`
- [ ] Configurar job no provedor para limpar tokens:
  `cd server && npm run tokens:limpar`
- [x] Garantir que os scripts retornem exit code diferente de zero em falhas.
- [ ] Habilitar alerta no provedor quando job retornar exit code diferente de zero.
- [x] Documentar horario sugerido e responsavel operacional a preencher em `docs/operacao/jobs.md`.
- [ ] Preencher responsavel, horario real e evidencia apos configurar o provedor.

## Testes

### 11. Testes automatizados essenciais

- [x] Login, logout e `/me` com cookie HttpOnly.
- [x] Cadastro de cliente.
- [x] Cadastro de prestador.
- [x] Confirmacao de e-mail.
- [x] Onboarding do prestador.
- [x] Assinatura ativa, pendente, atrasada, bloqueada e cancelada.
- [x] Busca exibindo somente prestadores aptos.
- [x] Regra central de elegibilidade documental para busca de prestadores.
- [x] Agendamento com conflito de horario.
- [x] Cancelamento e marcacao de nao realizado.
- [x] Upload de documento privado.
- [x] Webhook Asaas idempotente.
- [x] Rotas administrativas protegidas.

### 12. Testes end-to-end

- [ ] Criar suite E2E com Playwright ou ferramenta equivalente.
- [ ] Cobrir fluxo cliente: cadastro -> login -> busca -> agendamento -> cancelamento/avaliacao.
- [ ] Cobrir fluxo prestador: cadastro -> confirmacao -> perfil -> assinatura -> liberacao.
- [ ] Cobrir fluxo admin: login -> aprovar/revisar pendencias -> reprocessar assinatura.

## Observabilidade

### 13. Logs, metricas e alertas

- [x] Usar logs JSON em producao.
- [x] Adicionar request id por requisicao.
- [ ] Evitar CPF completo, senha, token, cartao, CVV e payload completo de webhook em logs.
- [ ] Criar alertas para erro 5xx.
- [ ] Criar alertas para falha em webhook.
- [ ] Criar alertas para falha em upload/scan.
- [ ] Criar alertas para jobs operacionais.
- [ ] Health check externo em `/health` e `/nossozelo/health`.
- [ ] Considerar health check com banco em endpoint separado e protegido para diagnostico operacional.

## Juridico e atendimento

### 14. Politicas publicas

- [ ] Revisar termos de uso com responsavel juridico.
- [ ] Revisar politica de privacidade.
- [ ] Revisar politica de cookies.
- [ ] Revisar politica de cancelamento.
- [ ] Criar politica de reembolso/disputa.
- [ ] Criar processo de denuncia.
- [ ] Criar processo de suporte.
- [ ] Definir retencao e exclusao de documentos.

## Arquitetura e manutencao

### 15. Refatoracoes planejadas

- [ ] Refatorar `server/src/src` em PR separado.
- [ ] Modularizar backend por dominio antes de crescer novas features:
  `auth`, `users`, `providers`, `scheduling`, `subscriptions`, `uploads`, `admin`.
- [ ] Remover metodos legados/redundantes do CRUD generico.
- [ ] Evitar novas dependencias sem necessidade clara.
- [ ] Revisar separacao entre API publica e controlador admin.

## Checklist final antes do deploy publico

- [ ] Builds de `server`, `client` e `controlador` passando.
- [ ] Testes automatizados passando.
- [ ] E2E minimo passando em staging.
- [ ] Banco de staging migrado e validado.
- [ ] Backup e restore testados.
- [ ] HTTPS ativo em todos os dominios.
- [ ] Cookies validados no dominio real.
- [ ] CORS restrito aos dominios finais.
- [ ] Rate limit distribuido ativo.
- [ ] Upload seguro validado ou uploads desabilitados.
- [ ] Asaas validado em ambiente real/homologacao.
- [ ] Jobs agendados ativos.
- [ ] Alertas configurados.
- [ ] Politicas publicas revisadas.
- [ ] Plano de rollback definido.
