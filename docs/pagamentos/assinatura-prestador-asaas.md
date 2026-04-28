# Assinatura mensal de prestadores

Prestadores dos tipos cuidador, enfermeiro e acompanhante precisam ter uma assinatura mensal ativa para operar profissionalmente na NossoZelo. Clientes comuns continuam com cadastro gratuito.

Sem assinatura ativa, o prestador pode acessar o site, perfil e financeiro, mas fica profissionalmente inativo: nao aparece na busca, nao recebe pedidos e ve alertas no perfil e na aba Financeiro.

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

Somente `usuarios.status_cadastro = ativo` com `assinaturas.status = ativa` libera busca, pedidos e perfil profissional ativo.

## Gateway mock

Nesta etapa nao existe integracao real com Asaas, nem criacao de cobranca real. O gateway mock permite testar as regras de negocio sem expor segredo financeiro ou acoplar a aplicacao ao provedor.

O resultado do mock e controlado por:

```env
PAYMENT_GATEWAY="mock"
MOCK_PAYMENT_RESULT="pendente"
```

Valores de `MOCK_PAYMENT_RESULT`:

- `aprovado`: ativa a assinatura imediatamente.
- `pendente`: deixa a assinatura aguardando confirmacao.
- `recusado`: marca assinatura como falha.
- `erro`: retorna erro controlado do gateway mock.

## Confirmacao em ate 72 horas

Quando o pagamento fica `pendente`, a assinatura entra em `aguardando_confirmacao` e recebe `confirmacao_expira_em` com 72 horas a partir da tentativa.

Durante esse prazo, o prestador continua acessando o site, mas nao aparece nas buscas, nao recebe pedidos e segue com perfil profissional inativo.

Se a confirmacao chegar no futuro, `Service_Assinatura.ativarAssinatura` deve ativar a assinatura. Se o prazo expirar, `Service_Assinatura.expirarAssinaturasSemConfirmacao` marca como `expirada`.

## Troca futura para Asaas

Toda comunicacao com gateway financeiro deve ficar em:

```text
server/src/src/gateways/pagamento
```

Para integrar Asaas no futuro:

1. Criar `server/src/src/gateways/pagamento/AsaasPagamentoGateway.ts`.
2. Implementar a interface `PagamentoGateway`.
3. Ajustar `server/src/src/gateways/pagamento/index.ts` para retornar o adapter Asaas quando `PAYMENT_GATEWAY=asaas`.

Variaveis previstas:

```env
ASAAS_ENVIRONMENT="sandbox"
ASAAS_API_KEY=""
ASAAS_WEBHOOK_TOKEN=""
ASAAS_BASE_URL="https://sandbox.asaas.com/api/v3"
```

Nao adicionar chaves reais ao repositorio.

## Arquivos que nao devem mudar na entrada do Asaas

Ao substituir o mock pelo Asaas real, nao altere as regras de negocio em:

- `server/src/src/service/Service_Assinatura.ts`
- `server/src/src/service/Service_Localizacao.ts`
- `server/src/src/service/Service_Agendamento.ts`
- `server/src/src/service/Service_Perfil.ts`
- controllers e rotas de assinatura, exceto se novos endpoints administrativos forem necessarios

A mudanca deve ficar concentrada no novo adapter `AsaasPagamentoGateway.ts` e no selector `index.ts`.
