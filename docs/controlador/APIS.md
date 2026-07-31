# Controlador - APIs administrativas

Todas as APIs abaixo passam por `src/proxy.ts`. As rotas administrativas tambem chamam `exigirAdminApi` internamente.

## Autenticacao

### `POST /api/auth/login`

Autentica administrador por e-mail ou CPF.

Entrada:

- `login`: e-mail ou CPF.
- `senha`: senha em texto puro enviada sobre HTTPS.

Saida:

- `message`
- `admin`
- cookie HttpOnly `controlador_session`

Seguranca:

- Zod valida payload.
- Rate limit por IP+login.
- Erro generico para credenciais invalidas.

### `POST /api/auth/logout`

Remove cookie de sessao administrativa.

### `GET /api/auth/me`

Retorna admin autenticado.

## Dashboard

### `GET /api/dashboard/resumo`

Retorna agregados operacionais para dashboard.

## Usuarios

### `GET /api/usuarios`

Lista usuarios com filtros e dados mascarados.

### `POST /api/usuarios`

Cria novo administrador.

Restricao:

- apenas `MASTER_ADMIN_EMAIL`.

### `GET /api/usuarios/[id]`

Busca detalhe de usuario por id.

### `POST /api/usuarios/[id]/bloquear`

Bloqueia usuario.

Protecao:

- impede bloquear o proprio admin logado.

### `POST /api/usuarios/[id]/liberar`

Libera usuario conforme regras operacionais.

### `POST /api/usuarios/[id]/confirmar-email`

Confirma e-mail manualmente e marca tokens pendentes como usados.

### `PATCH /api/usuarios/[id]/status-cadastro`

Atualiza status cadastral do usuario.

## Prestadores

### `GET /api/prestadores`

Lista prestadores das categorias cuidador, enfermeiro, acompanhante, baba, diarista/faxineira e motorista assistencial.

### `GET /api/prestadores/[id]`

Retorna detalhe do prestador, assinatura atual, servicos e indicadores.

### `POST /api/prestadores/[id]/bloquear`

Bloqueia prestador.

Protecao:

- impede bloquear o proprio admin logado.

### `POST /api/prestadores/[id]/liberar`

Libera prestador quando regras de cadastro e assinatura permitirem.

### `PATCH /api/prestadores/[id]/assinatura/status`

Atualiza assinatura do prestador pelo painel.

## Assinaturas

### `GET /api/assinaturas`

Lista assinaturas com filtros por status, gateway, prestador, vencidas e aguardando confirmacao.

### `GET /api/assinaturas/[id]`

Detalha assinatura e dados resumidos do prestador.

### `PATCH /api/assinaturas/[id]/alterar-status`

Altera status de assinatura.

Protecao:

- alguns status exigem confirmacao administrativa explicita.

### `POST /api/assinaturas/[id]/reprocessar`

Reprocessa assinatura a partir de dados internos e gateway quando aplicavel.

### `POST /api/assinaturas/sincronizar`

Sincroniza assinaturas e prestadores via sessao admin.

### `GET /api/assinaturas/sincronizar`

Endpoint de cron protegido por `CRON_SECRET` no header:

```http
Authorization: Bearer <CRON_SECRET>
```

## Planos

### `GET /api/planos`

Lista planos com filtros.

### `POST /api/planos`

Cria plano.

### `GET /api/planos/[id]`

Detalha plano.

### `PUT /api/planos/[id]`

Edita plano.

### `PATCH /api/planos/[id]/ativar`

Ativa plano.

Protecao:

- plano com valor zerado nao pode ser ativado.

### `PATCH /api/planos/[id]/desativar`

Desativa plano.

## E-mail

### `GET /api/email/pendentes`

Lista usuarios e tokens de confirmacao pendentes.

### `POST /api/email/reenviar`

Invalida tokens antigos e cria novo token de confirmacao.

Observacao:

O envio SMTP permanece centralizado no backend publico.

### `POST /api/email/confirmar-manual`

Confirma e-mail manualmente.

## Pendencias

### `GET /api/pendencias`

Retorna conjuntos operacionais:

- e-mails nao confirmados;
- prestadores sem assinatura ativa;
- pagamentos aguardando confirmacao;
- assinaturas expiradas;
- cadastros pendentes;
- prestadores sem dados profissionais.

## Logs

### `GET /api/logs`

Lista ultimas acoes administrativas.

## Webhook Asaas

### `POST /api/webhooks/asaas`

Recebe webhook Asaas no controlador.

Seguranca:

- rota publica no proxy;
- token validado por `ASAAS_WEBHOOK_TOKEN`;
- token precisa ter 32+ caracteres e nao pode parecer placeholder;
- payload e salvo/processado com idempotencia por evento/hash.
