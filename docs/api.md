# API

Base local: `http://localhost:4000/nossozelo`

## Health

- `GET /health`
- `GET /api/health`
- `GET /nossozelo/health`

## Autenticacao

- `POST /login/login`: cria cookie HttpOnly de sessao e retorna usuario sem senha.
- `GET /login/me`: retorna usuario autenticado e status de onboarding.
- `POST /login/logout`: limpa cookies de sessao.
- `GET /login/social/:provider`: inicia OAuth com state.
- `GET /login/social/:provider/callback`: grava cookie de sessao ou cookie temporario de cadastro social.
- `GET /login/social/cadastro-pendente`: retorna dados basicos do cadastro social pendente a partir de cookie HttpOnly.
- `POST /login/social/completar-cadastro`: conclui cadastro social e cria sessao.

## Cadastro e usuarios

- Publico: `POST /create-users/usuario`.
- Protegidos por dono/admin: `GET|PUT|DELETE /create-users/usuario/:id` e `PUT /create-users/usuario/:id/senha`.

## CRUD generico

Todas as rotas em `/crud` exigem admin. Use apenas para entidades permitidas e nunca para dados sensiveis.

## Assinaturas

`/assinaturas/planos` lista planos ativos com valor positivo. `/assinaturas/iniciar` exige prestador elegivel pelo onboarding.
