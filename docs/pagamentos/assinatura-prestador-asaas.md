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
ASAAS_BASE_URL="https://api.asaas.com/v3"
ASAAS_BILLING_TYPE="PIX"
```

Em producao, use a URL oficial do Asaas e uma chave `ASAAS_API_KEY` de producao. Em sandbox, use apenas dados de homologacao.

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

## Fluxo com Asaas

1. Prestador cria cadastro.
2. Prestador confirma e-mail.
3. Prestador acessa a aba Financeiro.
4. Prestador escolhe um plano ativo.
5. Backend reutiliza `gateway_customer_id` anterior, quando existir.
6. Backend cria uma assinatura mensal no Asaas e retorna `invoiceUrl`, `bankSlipUrl` ou Pix.
7. Assinatura local fica `aguardando_confirmacao`.
8. Prestador paga no ambiente/link do Asaas.
9. Asaas envia webhook real de pagamento.
10. Backend valida o token do webhook.
11. Backend atualiza assinatura e `usuarios.status_cadastro` somente quando o `subscription` do Asaas bater com `gateway_subscription_id`.
12. Prestador passa a aparecer na busca quando a assinatura ficar `ativa`.

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

Cada evento recebido ou gerado pelo sistema deve criar uma linha em `eventos_assinatura`. O campo `gateway_event_id` garante idempotencia: o mesmo evento do Asaas nao pode ser aplicado duas vezes. Eventos antigos que nao representam pagamento confirmado nao devem sobrescrever uma assinatura ja reativada por pagamento posterior.

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
- **Reprocessar**: recalcula `usuarios.status_cadastro` a partir do status atual da assinatura.
- **Alterar status**: acao administrativa manual, com confirmacao para status destrutivos como `cancelada`, `bloqueada` e `falhou`.

## Fluxo de regularizacao

Quando uma assinatura fica `pendente`, `atrasada`, `falhou`, `expirada`, `bloqueada` ou `cancelada`, a aba Financeiro mostra **Regularizar assinatura**.

Quando fica `aguardando_confirmacao`, a tela mostra **Pagamento em analise** e permite abrir ou gerar nova cobranca se necessario.

Quando fica `ativa`, a tela mostra **Gerenciar pagamento**. Nesta etapa, o NossoZelo nao coleta numero de cartao nem CVV; o prestador conclui pagamentos no Asaas.

## Pagamentos de contratacao

Pagamentos de contratacao entre cliente e prestador continuam fora deste fluxo. Para uma etapa futura, documente e migre `pagamentos.servico_id` para `pagamentos.contratacao_id`, mantendo compatibilidade por migration planejada. O status `contratacoes_status.manual` deve continuar restrito a atendimentos registrados manualmente por prestadores; se nao houver regra comercial clara, remova esse status em uma migration futura.
