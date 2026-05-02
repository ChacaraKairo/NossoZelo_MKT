# Modelagem financeira

Este documento classifica tabelas financeiras existentes para evitar confusao entre assinatura de prestadores e pagamentos futuros de contratacao.

## Assinatura de prestadores

Em uso atual:

- `planos`
- `assinaturas`
- `eventos_assinatura`

Essas tabelas sustentam a assinatura mensal via Asaas. O NossoZelo so considera assinatura `ativa` depois de webhook `PAYMENT_RECEIVED` ou `PAYMENT_CONFIRMED`.

## Tabelas auxiliares e futuro

- `cartoes`: futuro/legado. Nao usar para assinatura nesta etapa. O NossoZelo nao coleta numero de cartao nem CVV.
- `faturas`: parcial/legado. Nao e a fonte oficial do fluxo Asaas recorrente.
- `pagamentos`: futuro para pagamentos de contratacao. Hoje o campo `servico_id` referencia `contratacoes.id`, entao a migracao futura deve renomear para `contratacao_id`.
- `metodos_pagamento`: futuro/parcial para contratacoes. Nao controla assinatura Asaas.
- `dados_bancarios`: parcial/futuro para repasse a prestadores. Deve ser tratado como dado sensivel.

## Contratacoes

Pagamento de contratacao entre cliente e prestador fica fora da assinatura mensal.

Planejamento recomendado:

- Migrar `pagamentos.servico_id` para `pagamentos.contratacao_id`.
- Separar status operacional da contratacao de status financeiro.
- Evitar `contratacoes_status.paga`; pagamento deve viver em `pagamentos.status`.
- Revisar `contratacoes_status.manual`. Se representar atendimento registrado pelo prestador, substituir por `registrada_manualmente`; se nao houver regra clara, remover em migration futura.

