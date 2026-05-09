# Jobs operacionais

Este documento resume as rotinas que precisam rodar fora do ciclo de request HTTP.

## Comandos

Execute a partir de `server`:

```bash
npm run assinaturas:verificar
npm run assinaturas:expirar-pendentes
npm run tokens:limpar
```

Rotinas de banco:

```bash
npm run db:backup
npm run db:restore
```

## Frequencia sugerida

- `assinaturas:verificar`: a cada 30 ou 60 minutos.
- `assinaturas:expirar-pendentes`: a cada 30 ou 60 minutos.
- `tokens:limpar`: diariamente.
- `db:backup`: diariamente em producao, com retencao externa.
- `db:restore`: somente sob execucao manual controlada.

## Render Cron

Crie um Cron Job para cada rotina com o mesmo commit da API:

```bash
cd server && npm run assinaturas:verificar
cd server && npm run assinaturas:expirar-pendentes
cd server && npm run tokens:limpar
```

Configure as mesmas variaveis de ambiente da API, principalmente `DATABASE_URL`, `ASAAS_ENVIRONMENT`, `ASAAS_API_KEY`, `ASAAS_BASE_URL` e `ASAAS_WEBHOOK_TOKEN`.

## Falhas

Os scripts devem encerrar com `process.exitCode = 1` quando houver erro. O provedor de cron precisa alertar em qualquer execucao com exit code diferente de zero.

Os logs esperados sao resumidos: quantidade processada, quantidade alterada e erro operacional. Nao registrar senha, token, CPF completo, headers, cartao, CVV ou payload completo de webhook.

