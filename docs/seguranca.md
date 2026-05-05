# Seguranca

## Sessao

- Sessao principal via cookie HttpOnly `zelo_token`.
- `secure=true` em producao.
- `sameSite=lax` por padrao local; em producao cross-site o backend usa `none` automaticamente quando `FRONTEND_URL` e `BACKEND_PUBLIC_URL/API_URL` apontam para hosts diferentes. Tambem e possivel forcar com `COOKIE_SAMESITE=none`.
- JWT no JSON foi removido do login tradicional.

## Autorizacao

- Rotas de usuario exigem autenticacao e regra dono ou admin.
- CRUD generico exige usuario autenticado do tipo `admin`.
- Entidades sensiveis como `usuarios`, `recuperacao_senhas`, `cartoes`, `dados_bancarios`, `documentos_cuidadores`, logs e eventos financeiros sao bloqueadas no CRUD generico.
- Em producao, o CRUD administrativo so responde se `ENABLE_ADMIN_CRUD=true`.

## Headers e CORS

- `helmet` esta ativo no Express.
- CORS usa `ALLOWED_ORIGINS` e `credentials=true`; wildcard nao deve ser usado com credenciais.

## Logs

O logger mascara campos sensiveis por chave, incluindo senha, token, CPF, cookies, autorizacao, dados bancarios e chaves de API. Novos logs nao devem registrar payloads completos de login, upload, pagamento ou webhooks.

## Upload

- Validacao por MIME, extensao e assinatura binaria permanece no middleware.
- Em producao com `ENABLE_UPLOADS=true`, `UPLOAD_SCAN_MODE=clamav` e obrigatorio.
- O backend envia o buffer do upload ao clamd via protocolo `INSTREAM` antes de persistir no storage.
- Documentos privados retornam chave interna, nao URL publica.
- Variaveis AWS sao validadas antes de upload.
- Pendente: politica formal de retencao e quarentena operacional fora do processo web.

## Rate limit

O rate limit usa memoria apenas em desenvolvimento. Em producao, `RATE_LIMIT_STORE=upstash` e as variaveis `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` sao obrigatorias para evitar bypass por instancia.
