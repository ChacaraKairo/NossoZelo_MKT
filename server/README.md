# NossoZelo Server

API Express/TypeScript do marketplace NossoZelo.

## Rodar local

```bash
npm install
npx prisma generate
npm run dev
```

## Validar

```bash
npm test
npm run build
```

## Segurança aplicada

- `helmet()` habilitado.
- CORS com allowlist e `credentials: true`.
- `JWT_SECRET` forte obrigatorio no startup.
- Login cria cookie HttpOnly `zelo_token`.
- `/login/me` retorna a sessao autenticada sem expor senha.
- `/login/logout` limpa a sessao.
- `/crud` exige admin e usa allowlist de entidades.
- Rotas de usuario exigem dono do recurso ou admin.
- Upload de cadastro valida token temporario, extensao, MIME e magic bytes.

## Variaveis principais

Consulte `.env.example` e `../docs/PRODUCAO.md`.
