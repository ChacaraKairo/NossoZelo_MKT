# API

Base local: `http://localhost:4000/nossozelo`

## Saúde

- `GET /api/health`
- `GET /health`
- `GET /nossozelo/health`

## Auth

- `POST /login/login`: login tradicional. Body: `{ "identificador": "email-ou-cpf", "senha": "..." }`.
- `GET /login/me`: retorna usuário autenticado e `onboardingStatus`.
- `POST /login/logout`: limpa cookie de sessão.
- `GET /login/social/:provider`: inicia OAuth (`google` ou `facebook`).
- `GET /login/social/:provider/callback`: callback OAuth; define cookie e redireciona.
- `POST /login/social/completar-cadastro`: conclui cadastro social usando cookie temporário.
- `GET /login/social/cadastro-pendente`: lê cadastro social pendente.

## Usuários

- `POST /create-users/usuario`: cadastro público com rate limit.
- `GET /create-users/usuario/:id`: dono ou admin.
- `PUT /create-users/usuario/:id`: dono ou admin.
- `PUT /create-users/usuario/:id/senha`: dono ou admin; dono precisa enviar `senhaAtual`.
- `DELETE /create-users/usuario/:id`: dono ou admin.

## CRUD Administrativo

- `GET /crud/entities`
- `GET /crud/:entity`
- `GET /crud/:entity/:id`
- `POST /crud/:entity`
- `PUT /crud/:entity/:id`
- `DELETE /crud/:entity/:id`

Requer admin via JWT/cookie. Em produção, requer `ENABLE_ADMIN_CRUD=true`. Apenas entidades em allowlist são aceitas.

## Assinaturas

- `GET /assinaturas/planos`
- `GET /assinaturas/minha`
- `GET /assinaturas/status/:prestadorId`
- `POST /assinaturas/iniciar`
- `POST /assinaturas/regularizar`
- `POST /assinaturas/cancelar`
- `POST /assinaturas/webhook/asaas`

`GET /assinaturas/minha`, `GET /assinaturas/status/:prestadorId`, `POST /assinaturas/iniciar` e `POST /assinaturas/regularizar` retornam o contrato padronizado:

```json
{
  "assinatura": {
    "id": 10,
    "status": "aguardando_confirmacao",
    "plano_id": 1,
    "gateway": "asaas",
    "gateway_subscription_id": "sub_...",
    "gateway_payment_id": "pay_...",
    "data_ultimo_pagamento": null,
    "data_proximo_vencimento": null,
    "confirmacao_expira_em": "2026-05-11T21:00:00.000Z"
  },
  "acesso": {
    "liberado": false,
    "perfil_profissional_ativo": false,
    "pode_aparecer_na_busca": false,
    "pode_receber_pedidos": false,
    "motivo_bloqueio": "pagamento_aguardando_confirmacao",
    "mensagem_usuario": "Assinatura mensal criada. Pague a primeira cobranca e aguarde a confirmacao automatica do Asaas.",
    "proxima_acao": "pagar_fatura"
  },
  "pagamento": {
    "status_gateway": "pendente",
    "invoiceUrl": "https://...",
    "bankSlipUrl": null,
    "pixQrCode": null,
    "mensagem_gateway": "Assinatura criada no Asaas."
  }
}
```

## Agendamentos

- `POST /agendamentos`
- `PATCH /agendamentos/aceitar/:id`
- `PATCH /agendamentos/cancelar/:id`
- `PATCH /agendamentos/finalizar/:id`
- `POST /agendamentos/manual`
- `GET /agendamentos/prestador/:id`
- `GET /agendamentos/cliente/:id`

Todas exigem autenticação.

## Upload

- `POST /upload/completar-cadastro`: multipart com token temporário de cadastro/upload.
