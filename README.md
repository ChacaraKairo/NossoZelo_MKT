# NossoZelo MKT

Marketplace para conectar clientes a cuidadores, enfermeiros e acompanhantes.

## Estrutura

- `server`: API Express/TypeScript, Prisma/MySQL, autenticação, assinatura Asaas e upload S3.
- `client`: aplicação Next.js pública.
- `controlador`: painel administrativo Next.js.
- `docs`: arquitetura, segurança, operação e fluxos.

## Setup rapido

```bash
docker compose up --build
```

Ou rode cada app manualmente seguindo [docs/setup-local.md](docs/setup-local.md).

## Validacao

```bash
cd server && npm test && npm run build
cd client && npm run lint && npm run build
cd controlador && npm run prisma:generate && npm test && npm run lint && npm run build
docker compose config
```

## Segurança

As principais regras de produção estão em [docs/seguranca.md](docs/seguranca.md). A sessão web usa cookie HttpOnly; o frontend não deve persistir JWT em `localStorage`, `sessionStorage` ou cookie acessível por JavaScript.

## Status

MVP em hardening para ambiente real. Riscos restantes e checklist ficam em [docs/operacao/checklist-producao.md](docs/operacao/checklist-producao.md).
