# Seguranca

## Correcoes aplicadas

- CRUD generico protegido por JWT e perfil `admin`.
- CRUD generico limitado por allowlist; entidades sensiveis ficam bloqueadas mesmo para admin.
- Rotas de usuario protegidas por dono do recurso ou admin.
- JWT de sessao movido para cookie HttpOnly.
- Login social nao envia JWT de sessao por query string.
- `helmet()` aplicado no Express.
- CORS com `credentials: true`; `ALLOWED_ORIGINS` e obrigatorio em producao.
- `JWT_SECRET` fraco ou ausente bloqueia startup.
- Upload rejeita SVG, nomes suspeitos, extensao/MIME inconsistentes e magic bytes invalidos.

## Entidades bloqueadas no CRUD generico

`usuarios`, `admins`, `recuperacao_senhas`, `confirmacoes_email`, `logs_acesso`, `logs_acao`, `cartoes`, `dados_bancarios`, `documentos_cuidadores`, `assinaturas`, `pagamentos`, `eventos_assinatura`.

## Riscos restantes

- Bearer Authorization ainda e aceito temporariamente para compatibilidade.
- Falta integracao de antivirus/quarentena em documentos privados.
- Algumas telas ainda usam leitura sincrona antiga de usuario apenas para UX; a autorizacao real deve permanecer no backend.
- Cookies HttpOnly exigem HTTPS e dominios consistentes em producao.
