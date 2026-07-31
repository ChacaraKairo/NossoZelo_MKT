# Onboarding do prestador

O pagamento da assinatura faz parte da ativacao inicial do prestador. A area financeira continua existindo para regularizacao futura, mas a primeira cobranca deve ser guiada pelo onboarding.

## Fluxo

1. Prestador cria cadastro tradicional ou social.
2. Confirma e-mail.
3. Completa dados profissionais obrigatorios.
4. Escolhe um plano ativo.
5. Gera cobranca Asaas por link, boleto ou Pix.
6. Aguarda webhook de pagamento.
7. O perfil profissional fica ativo somente depois de `PAYMENT_RECEIVED` ou `PAYMENT_CONFIRMED`.

Se o prestador sair antes de pagar, ao fazer login novamente o frontend consulta `GET /onboarding/status` e redireciona para `/onboarding/prestador`.

## Categorias de prestadores

O fluxo vale para todos os tipos profissionais:

- cuidador;
- enfermeiro;
- acompanhante;
- baba;
- diarista;
- motorista assistencial.

Para `motorista_assistencial`, a placa do veiculo e obrigatoria no cadastro e na conclusao de perfil.

## Dados locais de demonstracao

O seed local cria prestadores ativos para validar busca, vitrine e cards sem depender do gateway:

- `cliente.demo@nossozelo.local` / `Demo@12345`
- `baba.demo@nossozelo.local` / `Demo@12345`
- `diarista.demo@nossozelo.local` / `Demo@12345`
- `motorista.demo@nossozelo.local` / `Demo@12345`

O cliente demo fica ativo e com localizacao em Sao Paulo para testar contratacao. Os prestadores ficam com e-mail confirmado, assinatura local ativa, localizacao em Sao Paulo, servico cadastrado e perfil profissional preenchido. O motorista demo usa placa `ABC1D23`.

## APIs

- `GET /nossozelo/onboarding/status`: rota autenticada que calcula a etapa atual e a proxima acao.
- `GET /nossozelo/assinaturas/planos`: lista apenas planos ativos com valor positivo.
- `POST /nossozelo/assinaturas/iniciar`: gera cobranca Asaas durante onboarding, exigindo prestador, e-mail confirmado, perfil profissional completo e plano ativo.

## Estados

Como o enum atual ainda nao possui `pendente_email` e `pendente_perfil`, o sistema usa a composicao abaixo:

- `confirmar_email`: `email_confirmado = false`.
- `completar_perfil`: e-mail confirmado, mas dados profissionais obrigatorios ausentes.
- `escolher_plano`: perfil completo e sem assinatura.
- `pagar_assinatura`: assinatura pendente, falha, expirada ou cancelada.
- `aguardando_confirmacao_pagamento`: assinatura `aguardando_confirmacao`.
- `ativo`: e-mail confirmado, `usuarios.status_cadastro = ativo` e assinatura `ativa`.
- `inadimplente`: assinatura atrasada/falha/expirada/cancelada depois de ja haver tentativa financeira.
- `bloqueado`: usuario ou assinatura bloqueados.

## Regras de ativacao

Cliente comum nao precisa de assinatura. Prestador nunca deve ficar profissionalmente ativo antes de:

- e-mail confirmado;
- dados profissionais obrigatorios preenchidos;
- assinatura ativa no NossoZelo.

`ACTIVE` no Asaas significa assinatura criada no gateway, nao pagamento confirmado no NossoZelo.

## Bloqueios

Busca publica e pedidos exigem:

- `email_confirmado = true`;
- `usuarios.status_cadastro = ativo`;
- assinatura mais recente com `status = ativa`.

Prestador pendente, aguardando confirmacao, inadimplente, bloqueado, cancelado ou expirado pode acessar a plataforma, mas nao aparece nas buscas e nao recebe pedidos.

## Asaas e webhook

O NossoZelo nao coleta cartao diretamente. A cobranca e o pagamento acontecem no Asaas. O webhook e responsavel por ativar, atrasar, bloquear ou cancelar a assinatura local com idempotencia por `gateway_event_id`.

Eventos duplicados retornam sucesso idempotente sem alterar assinatura. Eventos antigos que nao representam pagamento confirmado nao sobrescrevem status mais recente.
