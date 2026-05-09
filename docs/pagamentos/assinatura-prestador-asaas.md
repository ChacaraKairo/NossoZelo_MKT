# Assinatura mensal de prestadores com Asaas

Prestadores dos tipos cuidador, enfermeiro e acompanhante precisam ter uma assinatura mensal ativa para operar profissionalmente na NossoZelo. Clientes comuns continuam com cadastro gratuito.

Sem assinatura ativa, o prestador pode acessar o site, perfil e financeiro, mas fica profissionalmente inativo: nao aparece na busca, nao recebe pedidos e ve alertas no perfil e na aba Financeiro.

## Gestao de planos

Planos sao administrados pelo controlador em **Planos**. O painel permite criar, editar, ativar e desativar planos sem excluir historico financeiro.

Campos principais:

- `nome`
- `descricao`
- `valor`
- `beneficios`
- `ativo`
- `ordem`

O marketplace lista somente planos com `ativo = true` e `valor > 0`, ordenados por `ordem ASC, id ASC`.
Desative planos antigos em vez de excluir, porque assinaturas existentes continuam vinculadas ao plano historico.

## Valor real da assinatura

O valor cobrado vem do plano selecionado. `ASSINATURA_VALOR` pode sobrescrever o valor em cenarios controlados, mas deve ficar vazio em operacao normal.
Nao deixe `ASSINATURA_VALOR` como `0.01` fora de um teste isolado de sandbox.

```env
PAYMENT_GATEWAY="asaas"
ASSINATURA_VALOR=""
ASAAS_ENVIRONMENT="production"
ASAAS_BASE_URL="https://api.asaas.com/v3"
ASAAS_BILLING_TYPE="PIX"
```

Em producao, use `ASAAS_ENVIRONMENT="production"`, a URL oficial do Asaas e uma chave `ASAAS_API_KEY` de producao. Em sandbox, use `ASAAS_ENVIRONMENT="sandbox"` e apenas dados de homologacao.

## Status

Assinatura:

- `pendente`
- `aguardando_confirmacao`
- `ativa`
- `atrasada`
- `bloqueada`
- `cancelada`
- `falhou`
- `expirada`

Cadastro do usuario:

- `ativo`
- `pendente_pagamento`
- `aguardando_confirmacao_pagamento`
- `inadimplente`
- `bloqueado`
- `cancelado`

Somente `usuarios.email_confirmado = true`, `usuarios.status_cadastro = ativo` e `assinaturas.status = ativa` liberam busca, pedidos e perfil profissional ativo.

## Metodos de pagamento suportados

A assinatura recorrente do Asaas aceita `PIX`, `BOLETO`, `UNDEFINED` e `CREDIT_CARD` como `billingType` no endpoint `POST /v3/subscriptions`. O backend nao deve criar cobranca avulsa em `POST /v3/payments` para liberar prestador; a consulta a `/subscriptions/{id}/payments` serve apenas para recuperar a primeira fatura gerada pela assinatura mensal.

Para cartao de credito, o backend envia:

- `billingType: CREDIT_CARD`
- `creditCard`
- `creditCardHolderInfo`
- `remoteIp`

O Asaas valida o cartao ao criar a assinatura, mas a assinatura local do NossoZelo continua `aguardando_confirmacao` ate o webhook confiavel de pagamento.

Metodos internos aceitos pelo backend:

- `credit_card`: cartao de credito recorrente via API.
- `asaas_invoice`: fatura/checkout Asaas com `billingType = UNDEFINED`, caminho recomendado para debito.
- `pix`: assinatura Pix.
- `boleto`: assinatura boleto.

Cartao de debito nao e suportado como `billingType` de assinatura recorrente via API do Asaas. A documentacao do Asaas informa que dados de cartao de debito nao podem ser enviados pela API; debito pode aparecer na `invoiceUrl` de cobrancas quando o `billingType` e `CREDIT_CARD` ou `UNDEFINED`. Por isso o NossoZelo nao envia `metodoPagamento = debit_card` ao backend. Para debito, o metodo interno correto e `asaas_invoice`, que cria a assinatura com `billingType = UNDEFINED` e direciona o prestador para o checkout seguro do Asaas.

Nunca salve numero completo de cartao ou CVV. Esses dados podem existir apenas no payload em memoria da tentativa, enviados ao Asaas, e nao devem entrar em banco, evento financeiro, log ou analytics.

## Fluxo com Asaas

1. Prestador cria cadastro.
2. Prestador confirma e-mail.
3. Prestador continua o onboarding em `/onboarding/prestador`.
4. Prestador escolhe um plano ativo.
5. Backend reutiliza `gateway_customer_id` anterior, quando existir.
6. Prestador escolhe credito, checkout Asaas, Pix ou boleto. Debito direto via API nao e oferecido.
7. Backend cria uma assinatura mensal no Asaas usando `POST /v3/subscriptions`, `cycle = MONTHLY` e `nextDueDate` imediato.
8. Para credito, backend envia dados do cartao e titular ao Asaas, sem persistir numero completo ou CVV.
9. Para checkout Asaas/Pix/boleto, backend retorna `invoiceUrl`, `bankSlipUrl` ou Pix quando o Asaas disponibilizar a primeira cobranca.
10. Backend salva `gateway_customer_id`, `gateway_subscription_id`, `gateway_payment_id` da primeira cobranca, status local, prazo de confirmacao e links/PIX na resposta da tentativa.
11. Assinatura local fica `aguardando_confirmacao`, mesmo que o Asaas retorne `ACTIVE` ou aceite a criacao com cartao.
12. Prestador conclui o pagamento no cartao de credito recorrente, Pix/boleto ou checkout seguro do Asaas conforme o metodo.
13. Asaas envia webhook real de pagamento.
14. Backend valida o token do webhook.
15. Backend atualiza assinatura e `usuarios.status_cadastro` somente quando o `subscription` do Asaas bater com `gateway_subscription_id`.
16. Prestador passa a aparecer na busca quando a assinatura ficar `ativa`.

## Webhook

Cadastre no Asaas:

```text
https://SEU_BACKEND/nossozelo/assinaturas/webhook/asaas
https://SEU_CONTROLADOR/api/webhooks/asaas
```

O token configurado no painel do Asaas precisa ser igual ao valor de:

```env
ASAAS_WEBHOOK_TOKEN=""
```

Eventos principais:

- `PAYMENT_RECEIVED` e `PAYMENT_CONFIRMED`: ativam assinatura e usuario, desde que o e-mail esteja confirmado.
- `PAYMENT_OVERDUE`: marca assinatura como `atrasada` e o usuario como inadimplente.
- cancelamentos, falhas, chargeback ou refund: removem o prestador da busca ao atualizar o status local.

O webhook nao deve registrar payload completo com dados sensiveis. Registre apenas evento, IDs do gateway, assinatura local e status resultante.

No Asaas, `ACTIVE` indica que a assinatura recorrente foi criada e esta operacional no gateway. No NossoZelo, isso nao significa pagamento aprovado: a assinatura local so vira `ativa` depois de `PAYMENT_RECEIVED` ou `PAYMENT_CONFIRMED`.

Mesmo no fluxo de cartao de credito, HTTP 200 na criacao da assinatura significa que o Asaas aceitou/validou a assinatura, nao que o NossoZelo deve liberar o prestador imediatamente. O webhook continua sendo a fonte final da verdade.

Cada evento recebido ou gerado pelo sistema deve criar uma linha em `eventos_assinatura`. O campo `gateway_event_id` garante idempotencia: o mesmo evento do Asaas nao pode ser aplicado duas vezes. Eventos antigos que nao representam pagamento confirmado nao devem sobrescrever uma assinatura ja reativada por pagamento posterior.

O evento financeiro armazena `payload_hash` e `payload_resumo`, nunca o payload completo sensivel. `processado_em` marca quando o evento foi avaliado pelo sistema.

Eventos financeiros registrados:

- `assinatura_criada`
- `cobranca_criada`
- `pagamento_confirmado`
- `pagamento_atrasado`
- `assinatura_cancelada`
- `prestador_bloqueado`
- `prestador_reativado`
- `reprocessamento_admin`

## Confirmacao em ate 72 horas

Quando o pagamento fica pendente, a assinatura entra em `aguardando_confirmacao` e recebe `confirmacao_expira_em` com 72 horas a partir da tentativa.

Durante esse prazo, o prestador continua acessando o site, mas nao aparece nas buscas, nao recebe pedidos e segue com perfil profissional inativo.

Se o prazo expirar, `Service_Assinatura.expirarAssinaturasSemConfirmacao` marca como `expirada`.

## Rotinas operacionais

Execute em rotina agendada:

```bash
npm run assinaturas:verificar
npm run assinaturas:expirar-pendentes
npm run tokens:limpar
```

O webhook e a verificacao local trabalham juntos para bloquear, expirar e reativar prestadores conforme o estado financeiro. Em producao, rode esses comandos por cron, Render Cron Jobs, PM2 cron ou agendador equivalente. Falhas retornam exit code diferente de zero e devem gerar alerta operacional.

## Atuação do admin

No controlador:

- **Planos**: cria e mantém planos disponiveis para assinatura.
- **Assinaturas**: lista assinaturas, filtra por status/prestador e abre detalhe.
- **Detalhe da assinatura**: mostra prestador, plano, valor, status, gateway, IDs do Asaas e datas financeiras.
- **Reprocessar**: consulta o Asaas, atualiza `gateway_status` e datas conhecidas, mas nao ativa localmente uma assinatura apenas porque o gateway retornou `ACTIVE`.
- **Alterar status**: acao administrativa manual, com confirmacao para status destrutivos como `cancelada`, `bloqueada` e `falhou`.
- **Relatorio de inadimplencia**: lista prestadores fora da operacao por atraso, bloqueio, falha, expiracao ou cancelamento, com dados pessoais mascarados.

Todas as rotas administrativas passam por `exigirAdminApi`, com excecao intencional de login/logout e webhook publico do Asaas. O `controlador/src/proxy.ts` protege rotas de pagina e API no build de producao do Next, redirecionando para `/login` quando nao ha sessao administrativa valida.

## Fluxo de regularizacao

O pagamento inicial ocorre durante o onboarding do prestador. A aba Financeiro continua existindo para regularizacao futura depois que o cadastro ja foi criado.

Quando uma assinatura fica `pendente`, `atrasada`, `falhou`, `expirada`, `bloqueada` ou `cancelada`, a aba Financeiro mostra **Regularizar assinatura**.

Quando fica `aguardando_confirmacao`, a tela mostra **Pagamento em analise** e permite abrir ou gerar nova cobranca se necessario.

Quando fica `ativa`, a tela mostra **Gerenciar pagamento**. Troca futura de cartao deve usar fluxo seguro do Asaas, preferencialmente tokenizacao ou endpoint proprio de atualizacao de cartao da assinatura. Numero completo e CVV nunca devem ser persistidos.

## Seguranca operacional

O backend aplica rate limit em login, cadastro, recuperacao de senha, confirmacao e reenvio de e-mail.

O login social usa `state` OAuth salvo em cookie HTTP-only temporario. Logs devem continuar passando pelo logger sanitizado e nao devem incluir senha, token, CPF completo, cartao, CVV ou headers sensiveis.

## FAQ publica

A pagina `/assinatura` explica ao prestador o fluxo de cadastro, confirmacao de e-mail, escolha de plano, pagamento no Asaas, espera de confirmacao e reativacao apos regularizacao.

## Pagamentos de contratacao

Pagamentos de contratacao entre cliente e prestador continuam fora deste fluxo. Para uma etapa futura, documente e migre `pagamentos.servico_id` para `pagamentos.contratacao_id`, mantendo compatibilidade por migration planejada. O status `contratacoes_status.manual` deve continuar restrito a atendimentos registrados manualmente por prestadores; se nao houver regra comercial clara, remova esse status em uma migration futura.
