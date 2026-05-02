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
- Completar perfil profissional antes da assinatura.
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

## UX do prestador

- Validar fluxo: cadastro -> confirmacao de e-mail -> completar perfil -> escolher plano -> gerar cobranca -> pagar -> aguardar confirmacao -> perfil ativo.
- Confirmar mensagens para `email_nao_confirmado`, `pagamento_pendente`, `pagamento_aguardando_confirmacao`, `assinatura_atrasada`, `assinatura_bloqueada`, `assinatura_cancelada` e `perfil_ativo`.
- Confirmar que prestador pendente, atrasado, bloqueado, cancelado, expirado ou com falha nao aparece na busca publica.
- Testar cadastro prestador tradicional, cadastro prestador social, saida antes de pagar e login posterior redirecionando para `/onboarding/prestador`.
- Testar geracao de cobranca, tela de aguardando confirmacao e ativacao apos webhook de pagamento confirmado.

## Operacao

- Configurar cron dos jobs.
- Verificar alertas para exit code diferente de zero.
- Executar ensaio de restore em homologacao.
- Validar health check.
- Revisar logs para ausencia de CPF completo, senha, token, headers, cartao, CVV e payload completo de webhook.
- Confirmar em build que o controlador usa `src/proxy.ts` para proteger paginas e APIs admin. Em Next 16, nao manter `middleware.ts` junto com `proxy.ts`.
# Checklist de producao

- [ ] `JWT_SECRET` forte e exclusivo por ambiente.
- [ ] `ALLOWED_ORIGINS` sem wildcard e com dominios finais.
- [ ] HTTPS ativo para API, client e controlador.
- [ ] Cookie HttpOnly validado no dominio real.
- [ ] OAuth callback sem JWT na URL.
- [ ] Webhook Asaas testado com evento duplicado e evento antigo.
- [ ] Buckets S3 publico/privado revisados.
- [ ] Antivirus/quarentena definido para documentos privados.
- [ ] `docker compose config` sem erro.
- [ ] CI verde em pull request.
- [ ] Backup e restore testados em banco de homologacao.
- [ ] Rotas CRUD genericas inacessiveis para anonimo e nao-admin.
