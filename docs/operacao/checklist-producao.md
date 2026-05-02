# Checklist manual de producao

Use quando a validacao automatica nao conseguir provar o comportamento real do ambiente.

## Banco e migrations

- Aplicar migrations em banco de homologacao.
- Rodar teste com `TEST_DATABASE_URL` antes de producao.
- Confirmar colunas de `planos`: `descricao`, `ativo`, `ordem`, `criado_em`, `atualizado_em`.
- Confirmar tabela `eventos_assinatura` com `payload_hash` e `processado_em`.

## Asaas

- Criar prestador real de homologacao.
- Confirmar e-mail.
- Selecionar plano ativo.
- Gerar cobranca.
- Confirmar que retorna `invoiceUrl`, `bankSlipUrl` ou Pix.
- Pagar em sandbox/homologacao.
- Confirmar webhook `PAYMENT_CONFIRMED`.
- Confirmar assinatura local `ativa`.
- Confirmar prestador aparece na busca.
- Simular `PAYMENT_OVERDUE`.
- Confirmar prestador sai da busca.
- Reprocessar no controlador e confirmar que `ACTIVE` do Asaas nao ativa localmente sem pagamento.

## Operacao

- Configurar cron dos jobs.
- Verificar alertas para exit code diferente de zero.
- Executar ensaio de restore em homologacao.
- Validar health check.
- Revisar logs para ausencia de CPF completo, senha, token, headers, cartao, CVV e payload completo de webhook.
- Confirmar em build que o controlador usa `src/proxy.ts` para proteger paginas e APIs admin. Em Next 16, nao manter `middleware.ts` junto com `proxy.ts`.
