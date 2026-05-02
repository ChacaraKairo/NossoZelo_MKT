# NossoZelo_MKT

Marketplace web para conectar clientes a cuidadores, enfermeiros e acompanhantes. O estado atual foi preparado como MVP funcional: autenticação por cookie HttpOnly, rotas sensíveis protegidas, CRUD administrativo restrito, testes mínimos, seed, Docker e documentação básica.

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, MySQL, JWT, Vitest, Supertest.
- Frontend: Next.js Pages Router, React, TypeScript, Axios.
- Integrações previstas: Asaas, AWS S3, OAuth Google/Facebook, SMTP.

## Estrutura

- `server/`: API Express, Prisma, testes e scripts operacionais.
- `client/`: aplicação web pública e áreas autenticadas.
- `controlador/`: painel administrativo Next.js separado.
- `docs/`: notas de produção, segurança e API.
- `docker-compose.yml`: ambiente local com MySQL, backend e frontend.

## Rodando Localmente

Backend:

```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Frontend:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Docker:

```bash
docker compose up --build
```

## Banco E Prisma

Comandos principais:

```bash
cd server
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
```

O seed cria planos ativos, métodos de pagamento e opcionalmente um admin via `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`.

## Scripts

Backend: `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run start`.

Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run start`.

## Autenticação

O login tradicional define cookie HttpOnly `zelo_token`. O backend aceita o cookie e mantém compatibilidade com `Authorization: Bearer` para fluxos temporários. O frontend não acessa JWT de sessão diretamente.

Rotas principais:

- `POST /nossozelo/login/login`
- `GET /nossozelo/login/me`
- `POST /nossozelo/login/logout`

## Fluxos

- Cadastro: cria usuário, envia confirmação de e-mail e gera token temporário para upload.
- Login: valida credenciais e inicia sessão por cookie HttpOnly.
- Onboarding prestador: exige e-mail confirmado, perfil profissional e assinatura ativa.
- Assinatura: lista planos, inicia/regulariza/cancela assinatura e processa webhook Asaas.
- Busca de prestador: deve mostrar apenas prestadores aptos conforme assinatura/status.
- Agendamento: exige autenticação e valida disponibilidade/conflito no serviço.
- Upload: valida MIME/extensão/assinatura binária e grava documentos privados por chave, não URL pública.

## Limitações Conhecidas

- Rate limit ainda é em memória, adequado só para desenvolvimento/instância única.
- Antivírus/quarentena de uploads está documentado como TODO.
- Enums de dia da semana têm encoding legado (`terÃƒÂ§a`, `sÃƒÂ¡bado`) e exigem migração controlada.
- A pasta `server/src/src` foi mantida para reduzir risco de quebra; novos imports devem seguir o padrão atual até refatoração planejada.
- O painel `controlador/` não foi tratado como alvo principal deste ciclo.

## Antes De Produção

Veja [docs/PRODUCAO.md](docs/PRODUCAO.md) e [docs/SEGURANCA.md](docs/SEGURANCA.md). O MVP está mais seguro e testável, mas ainda não deve ser anunciado como pronto para produção sem Redis/rate limit distribuído, hardening de uploads, revisão completa do painel admin, observabilidade e testes end-to-end.
