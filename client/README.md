# NossoZelo Client

Aplicacao Next.js publica para clientes e prestadores.

## Rodar local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Validar

```bash
npm run lint
npm run build
```

## Autenticacao

O client usa cookie HttpOnly criado pelo backend. Requisicoes para a API devem usar `credentials: include` ou o axios configurado em `src/service/api.ts`.

Nao grave JWT em `localStorage`, `sessionStorage` ou cookie via JavaScript.

## Onboarding do prestador

Prestadores incompletos sao direcionados para `/onboarding/prestador` ate confirmar e-mail, completar perfil, escolher plano e aguardar pagamento Asaas confirmado.
