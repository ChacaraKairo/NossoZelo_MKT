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

## Agenda operacional

Preencha o responsavel antes de liberar producao.

| Rotina | Comando | Frequencia sugerida | Cron sugerido | Responsavel |
| --- | --- | --- | --- | --- |
| Verificar assinaturas | `cd server && npm run assinaturas:verificar` | A cada 30 minutos | `*/30 * * * *` | PREENCHER |
| Expirar pendencias | `cd server && npm run assinaturas:expirar-pendentes` | A cada 30 minutos, alternado da verificacao | `15,45 * * * *` | PREENCHER |
| Limpar tokens | `cd server && npm run tokens:limpar` | Diariamente, fora do pico | `20 3 * * *` | PREENCHER |
| Backup | `cd server && npm run db:backup` | Diariamente em producao, com retencao externa | `40 2 * * *` | PREENCHER |
| Restore | `cd server && npm run db:restore` | Somente manual, com aprovacao operacional | Manual | PREENCHER |

Use timezone `America/Sao_Paulo` quando o provedor permitir configurar timezone. Se o provedor usar UTC, converta os horarios acima antes de salvar.

## Render Cron

Crie um Cron Job para cada rotina com o mesmo commit da API:

```bash
cd server && npm run assinaturas:verificar
cd server && npm run assinaturas:expirar-pendentes
cd server && npm run tokens:limpar
```

Configure as mesmas variaveis de ambiente da API, principalmente `DATABASE_URL`, `ASAAS_ENVIRONMENT`, `ASAAS_API_KEY`, `ASAAS_BASE_URL` e `ASAAS_WEBHOOK_TOKEN`.

Checklist por job no provedor:

- Comando igual ao documentado.
- Branch/commit igual ao deploy da API.
- Timezone conferido.
- Variaveis de ambiente copiadas do backend de producao.
- Alerta habilitado para execucao com falha.
- Ultima execucao manual registrada antes de ativar recorrencia.

## Exemplo de crontab

Use somente em servidor com Node, dependencias instaladas e variaveis de producao carregadas pelo ambiente.

```cron
*/30 * * * * cd /app/server && npm run assinaturas:verificar
15,45 * * * * cd /app/server && npm run assinaturas:expirar-pendentes
20 3 * * * cd /app/server && npm run tokens:limpar
```

## Falhas

Os scripts devem encerrar com `process.exitCode = 1` quando houver erro. O provedor de cron precisa alertar em qualquer execucao com exit code diferente de zero.

Os logs esperados sao resumidos: quantidade processada, quantidade alterada e erro operacional. Nao registrar senha, token, CPF completo, headers, cartao, CVV ou payload completo de webhook.

## Registro operacional

Atualize esta tabela apos configurar o provedor real.

| Data | Ambiente | Rotina | Provedor | Horario configurado | Responsavel | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| PREENCHER | producao | `assinaturas:verificar` | PREENCHER | PREENCHER | PREENCHER | PREENCHER |
| PREENCHER | producao | `assinaturas:expirar-pendentes` | PREENCHER | PREENCHER | PREENCHER | PREENCHER |
| PREENCHER | producao | `tokens:limpar` | PREENCHER | PREENCHER | PREENCHER | PREENCHER |
