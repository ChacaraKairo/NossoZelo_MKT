# Setup local

## Requisitos

- Node.js 20+
- MySQL 8+
- Docker Desktop opcional

## Rodando com Docker

```bash
docker compose up --build
```

Servicos:

- Client: `http://localhost:3000`
- Server: `http://localhost:4000`
- Controlador: `http://localhost:3001`
- MySQL: `localhost:3306`

## Rodando manualmente

Server:

```bash
cd server
npm install
npx prisma generate
npm run dev
```

Client:

```bash
cd client
npm install
npm run dev
```

Controlador:

```bash
cd controlador
npm install
npm run prisma:generate
npm run dev
```

## Variaveis obrigatorias principais

- `DATABASE_URL`
- `JWT_SECRET` com pelo menos 32 caracteres
- `ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `AWS_PUBLIC_BUCKET_NAME`, `AWS_PRIVATE_BUCKET_NAME`
- `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`
