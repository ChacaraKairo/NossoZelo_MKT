# Segurança

## Sessão

- Sessão principal via cookie HttpOnly `zelo_token`.
- `secure=true` em produção.
- `sameSite=lax` por padrão local; em produção cross-site o backend usa `none` automaticamente quando `FRONTEND_URL` e `BACKEND_PUBLIC_URL/API_URL` apontam para hosts diferentes. Também é possível forçar com `COOKIE_SAMESITE=none`.
- JWT no JSON foi removido do login tradicional.

## Autorização

- Rotas de usuário exigem autenticação e regra dono ou admin.
- CRUD genérico exige usuário autenticado do tipo `admin`.
- Entidades sensíveis como `usuarios`, `recuperacao_senhas`, `cartoes`, `dados_bancarios`, `documentos_cuidadores`, logs e eventos financeiros são bloqueadas no CRUD genérico.
- Em produção, o CRUD administrativo só responde se `ENABLE_ADMIN_CRUD=true`.

## Headers E CORS

- `helmet` está ativo no Express.
- CORS usa `ALLOWED_ORIGINS` e `credentials=true`; wildcard não deve ser usado com credenciais.

## Logs

O logger mascara campos sensíveis por chave, incluindo senha, token, CPF, cookies, autorização, dados bancários e chaves de API. Novos logs não devem registrar payloads completos de login, upload, pagamento ou webhooks.

## Upload

- Validação por MIME, extensão e assinatura binária permanece no middleware.
- Documentos privados retornam chave interna, não URL pública.
- Variáveis AWS são validadas antes de upload.
- Pendente: antivírus/quarentena e política formal de retenção.

## Rate Limit

O rate limit atual é em memória. Em produção multi-instância, substituir por Redis/Upstash/ElastiCache para evitar bypass por instância.
