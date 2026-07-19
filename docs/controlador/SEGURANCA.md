# Controlador - seguranca

Este documento descreve as camadas de seguranca adicionadas ao painel administrativo.

## Principio

O controlador e uma aplicacao administrativa. Qualquer falha nele pode alterar dados de usuarios, prestadores, planos, assinaturas e logs. Por isso a configuracao padrao deve ser conservadora.

## Camadas implementadas

### Sessao administrativa

- Cookie: `controlador_session`.
- Propriedades: `HttpOnly`, `SameSite=Strict`, `Secure` em producao, `path=/`.
- Duracao: 8 horas.
- Token: JWT HS256 assinado com `JWT_ADMIN_SECRET`.
- Payload: id, nome, e-mail e tipo `admin`.

### Validacao de usuario

Mesmo com JWT valido, `obterSessaoAdmin` consulta o banco para confirmar que:

- o usuario ainda existe;
- o tipo continua sendo `admin`.

Isso reduz risco quando um admin e removido ou muda de permissao durante uma sessao ativa.

### Proxy central

Arquivo: `controlador/src/proxy.ts`.

Responsabilidades:

- aplicar headers de seguranca;
- bloquear mutacoes vindas de origem externa;
- liberar somente rotas publicas explicitas;
- responder `401` em APIs sem sessao;
- redirecionar paginas sem sessao para `/login`;
- impedir admin autenticado de voltar para `/login`.

### Protecao contra CSRF por origem

Arquivo: `controlador/src/lib/security.ts`.

Metodos protegidos:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Excecoes:

- `/api/webhooks/asaas`
- `/api/assinaturas/sincronizar`

Fontes aceitas:

- origem da propria requisicao;
- `CONTROLADOR_PUBLIC_URL`;
- `VERCEL_URL`;
- itens em `ADMIN_ALLOWED_ORIGINS`.

Em producao, requisicao mutavel sem `Origin` ou `Referer` e rejeitada.

### Headers defensivos

Aplicados pelo proxy:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-Robots-Tag: noindex, nofollow`
- `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; form-action 'self'`

Objetivo:

- reduzir clickjacking;
- impedir indexacao do painel;
- reduzir vazamento de referer;
- limitar permissoes de navegador;
- impedir que o painel seja embutido em iframe.

### Rate limit de login

Arquivo: `controlador/src/app/api/auth/login/route.ts`.

Regra:

- 5 falhas por janela de 15 minutos;
- chave por IP + login informado;
- contador incrementa somente em falha real;
- contador limpa apos login correto;
- resposta de erro nao revela se o login existe ou se faltou permissao admin.

Observacao:

O rate limit atual e em memoria. Em ambiente multi-instancia, use uma camada externa no provedor, WAF, edge middleware ou Redis.

### Admin mestre

Algumas acoes usam `adminEhMestre`, baseado em `MASTER_ADMIN_EMAIL`.

Acoes atuais:

- criacao de novos administradores.

Recomendacao:

Manter criacao de admins restrita ao master e usar e-mails institucionais.

## Configuracao obrigatoria de producao

```env
NODE_ENV=production
DATABASE_URL=...
JWT_ADMIN_SECRET=...
MASTER_ADMIN_EMAIL=...
CRON_SECRET=...
CONTROLADOR_PUBLIC_URL=https://admin.seudominio.com
ASAAS_ENVIRONMENT=production
ASAAS_API_KEY=...
ASAAS_WEBHOOK_TOKEN=...
ASAAS_BASE_URL=https://api.asaas.com/v3
```

## Checklist antes de publicar

- `JWT_ADMIN_SECRET` forte, unico e com 32+ caracteres.
- `CRON_SECRET` forte, unico e com 32+ caracteres.
- `CONTROLADOR_PUBLIC_URL` com HTTPS final.
- `MASTER_ADMIN_EMAIL` apontando para o admin responsavel.
- `ASAAS_WEBHOOK_TOKEN` igual ao token configurado no Asaas.
- Painel publicado em dominio nao divulgado publicamente.
- HTTPS ativo.
- Logs sem senha, token, CPF completo, cartao ou payload integral de webhook.
- CI rodando `lint`, `test` e `build` do controlador.

## Pontos que ainda podem evoluir

- Autenticacao multi-fator para administradores.
- Rate limit distribuido.
- Allowlist de IP ou VPN.
- Auditoria mais granular por acao.
- Sessao com rotacao de token.
- Perfis administrativos com permissoes finas.
- Alertas para login falho repetido.
