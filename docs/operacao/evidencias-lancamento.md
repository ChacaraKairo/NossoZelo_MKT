# Evidencias de lancamento

Use este arquivo para registrar a validacao de staging e producao antes de liberar usuarios reais. Nao substitui os checklists detalhados; ele serve como folha de evidencia executiva.

## Decisao de ambiente

- [ ] Ambiente validado: `staging` ou `production`.
- [ ] Dominio final definido.
- [ ] HTTPS ativo.
- [ ] `ALLOWED_ORIGINS` restrito aos dominios finais.
- [ ] Cookies testados no dominio real.
- [ ] Plano de rollback documentado.

Evidencia:

```text
Data:
Responsavel:
URLs:
Observacoes:
```

## Banco e deploy limpo

- [ ] Banco PostgreSQL gerenciado criado.
- [ ] `npx prisma migrate deploy` executado no `server`.
- [ ] `npx prisma generate` executado no `server`.
- [ ] `npx prisma generate` executado no `controlador`.
- [ ] Seed aplicado apenas quando apropriado para o ambiente.
- [ ] Backup e restore testados.

Comandos de referencia:

```bash
cd server && npx prisma migrate deploy && npx prisma generate
cd controlador && npx prisma generate
cd server && npm run db:backup
```

Evidencia:

```text
Banco:
Migration aplicada:
Backup:
Restore:
Observacoes:
```

## Builds e testes

- [ ] `server`: `npm run lint`.
- [ ] `server`: `npm test`.
- [ ] `server`: `npm run build`.
- [ ] `client`: `npm run build`.
- [ ] `controlador`: `npm run build`.
- [ ] Docker Compose validado do zero em ambiente local limpo.

Comandos de referencia:

```bash
cd server && npm run lint && npm test && npm run build
cd client && npm run build
cd controlador && npm run build
docker compose up --build
```

Evidencia:

```text
Commit:
Server:
Client:
Controlador:
Docker:
Observacoes:
```

## Segurança minima

- [ ] `JWT_SECRET` forte e exclusivo.
- [ ] `RATE_LIMIT_STORE=upstash`.
- [ ] `UPSTASH_REDIS_REST_URL` configurado.
- [ ] `UPSTASH_REDIS_REST_TOKEN` configurado.
- [ ] Limite real testado em staging, incluindo resposta `429`.
- [ ] `ENABLE_ADMIN_CRUD=false`.
- [ ] `ENABLE_UPLOADS=false` enquanto S3, ClamAV e auditoria nao estiverem fechados.
- [ ] Logs revisados para nao expor senha, token, CPF completo, cookie, cartao, CVV ou payload completo de webhook.
- [ ] `X-Request-Id` confirmado nas respostas HTTP.

Evidencia:

```text
Rate limit:
Headers:
Logs:
Observacoes:
```

## Pagamentos Asaas

Nao cobrar dinheiro real antes desta secao estar concluida.

- [ ] Ambiente Asaas definido.
- [ ] `PAYMENT_GATEWAY=asaas`.
- [ ] `ASAAS_API_KEY` configurada.
- [ ] `ASAAS_WEBHOOK_TOKEN` forte.
- [ ] Webhook backend configurado: `/nossozelo/assinaturas/webhook/asaas`.
- [ ] Webhook controlador configurado: `/api/webhooks/asaas`.
- [ ] Cartao testado.
- [ ] Pix testado.
- [ ] Boleto testado.
- [ ] `PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED` ativa assinatura local.
- [ ] Prestador ativo aparece na busca.
- [ ] Inadimplencia remove prestador da busca.
- [ ] Cancelamento testado.
- [ ] Reprocessamento pelo controlador testado.
- [ ] Idempotencia de webhook validada.

Evidencia:

```text
Assinatura teste:
Eventos recebidos:
Reprocessamento:
Observacoes:
```

## Uploads

Recomendacao para primeiro deploy publico: manter uploads desativados.

- [ ] Bucket publico apenas para fotos permitidas.
- [ ] Bucket privado para documentos.
- [ ] Documento privado retorna chave interna, nao URL publica.
- [ ] ClamAV/clamd configurado.
- [ ] Arquivo limpo testado.
- [ ] EICAR testado em staging.
- [ ] Quarentena operacional definida.
- [ ] Auditoria de upload, scan e liberacao registrada.

Evidencia:

```text
ENABLE_UPLOADS:
S3:
ClamAV:
Auditoria:
Observacoes:
```

## E2E manual ou automatizado

- [ ] Cliente: cadastro -> login -> busca -> agendamento -> cancelamento/avaliacao.
- [ ] Prestador: cadastro -> confirmacao -> perfil -> assinatura -> liberacao.
- [ ] Admin: login -> revisar pendencias -> reprocessar assinatura.
- [ ] Categorias novas: baba, diarista/faxineira e motorista assistencial.
- [ ] Motorista assistencial com placa validada.

Evidencia:

```text
Cliente:
Prestador:
Admin:
Novas categorias:
Observacoes:
```

## Jobs e monitoramento

- [ ] `assinaturas:verificar` agendado.
- [ ] `assinaturas:expirar-pendentes` agendado.
- [ ] `tokens:limpar` agendado.
- [ ] Alerta para falha de job.
- [ ] Monitoramento externo em `/health`.
- [ ] Monitoramento externo em `/nossozelo/health`.
- [ ] Alerta para erro `5xx`.
- [ ] Alerta para falha em webhook.

Evidencia:

```text
Jobs:
Health checks:
Alertas:
Responsavel:
Observacoes:
```

## Juridico e atendimento

- [ ] Termos de Uso revisados.
- [ ] Politica de Privacidade revisada.
- [ ] Politica de Cookies revisada.
- [ ] Politica de Cancelamento revisada.
- [ ] Politica de Reembolso/Disputa criada.
- [ ] Processo de Denuncia definido.
- [ ] Processo de Suporte definido.
- [ ] Retencao e exclusao de documentos definida.

Evidencia:

```text
Politicas:
Atendimento:
Documentos:
Responsavel:
Observacoes:
```

