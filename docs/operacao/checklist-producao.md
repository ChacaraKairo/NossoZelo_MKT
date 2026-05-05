# Checklist manual de producao

Use quando a validacao automatica nao conseguir provar o comportamento real do ambiente.

## Banco e migrations

- [ ] Aplicar migrations em banco de homologacao.
- [ ] Rodar teste com `TEST_DATABASE_URL` antes de producao.
- [ ] Confirmar colunas de `planos`: `descricao`, `ativo`, `ordem`, `criado_em`, `atualizado_em`.
- [ ] Confirmar tabela `eventos_assinatura` com `payload_hash` e `processado_em`.
- [ ] Executar ensaio de backup e restore.

## Infra e seguranca

- [ ] `JWT_SECRET` forte e exclusivo por ambiente.
- [ ] `ALLOWED_ORIGINS` sem wildcard e com dominios finais.
- [ ] HTTPS ativo para API, client e controlador.
- [ ] Cookie HttpOnly validado no dominio real.
- [ ] `RATE_LIMIT_STORE=upstash` configurado.
- [ ] Upstash/Redis testado com bloqueio real.
- [ ] `ENABLE_ADMIN_CRUD=false`.
- [ ] Buckets S3 publico/privado revisados.
- [ ] `UPLOAD_SCAN_MODE=clamav` configurado quando `ENABLE_UPLOADS=true`.
- [ ] ClamAV validado com arquivo limpo e EICAR em staging.
- [ ] Logs revisados para ausencia de CPF completo, senha, token, headers, cartao, CVV e payload completo de webhook.

## Asaas

- [ ] Criar prestador real de homologacao.
- [ ] Confirmar e-mail.
- [ ] Completar perfil profissional antes da assinatura.
- [ ] Selecionar plano ativo.
- [ ] Testar cartao de credito recorrente.
- [ ] Testar checkout Asaas (`asaas_invoice`) com `invoiceUrl`.
- [ ] Testar Pix.
- [ ] Testar boleto.
- [ ] Confirmar webhook `PAYMENT_CONFIRMED`.
- [ ] Confirmar assinatura local `ativa`.
- [ ] Confirmar prestador aparece na busca.
- [ ] Simular `PAYMENT_OVERDUE`.
- [ ] Confirmar prestador sai da busca.
- [ ] Reprocessar no controlador e confirmar que `ACTIVE` do Asaas nao ativa localmente sem pagamento.

## UX do prestador

- [ ] Validar fluxo: cadastro -> confirmacao de e-mail -> completar perfil -> escolher plano -> pagar -> aguardar confirmacao -> perfil ativo.
- [ ] Confirmar mensagens para `email_nao_confirmado`, `pagamento_pendente`, `pagamento_aguardando_confirmacao`, `assinatura_atrasada`, `assinatura_bloqueada`, `assinatura_cancelada` e `perfil_ativo`.
- [ ] Confirmar que prestador pendente, atrasado, bloqueado, cancelado, expirado ou com falha nao aparece na busca publica.
- [ ] Testar cadastro prestador tradicional, cadastro prestador social, saida antes de pagar e login posterior redirecionando para `/onboarding/prestador`.

## Operacao e venda

- [ ] Termos de uso publicados.
- [ ] Politica de privacidade publicada.
- [ ] Processo de validacao de prestador definido.
- [ ] Canal de suporte ativo.
- [ ] Processo de denuncia definido.
- [ ] Politica de cancelamento definida.
- [ ] Politica de reembolso/disputa definida.
- [ ] Cron dos jobs configurado.
- [ ] Alertas para exit code diferente de zero.
- [ ] Controlador protegido por `src/proxy.ts` em build de producao.
