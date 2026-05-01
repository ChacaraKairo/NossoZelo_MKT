# Controlador NossoZelo

Painel administrativo interno do NossoZelo. Este app Next.js é independente do `client` e do `server`, mas usa o mesmo banco via Prisma.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie `.env.local` com base no `.env.example`.
3. Gere o Prisma Client:
   ```bash
   npm run prisma:generate
   ```
4. Suba o painel:
   ```bash
   npm run dev
   ```

## Variáveis

- `DATABASE_URL`: conexão do banco existente do NossoZelo.
- `JWT_ADMIN_SECRET`: segredo exclusivo da sessão admin.
- `NEXT_PUBLIC_APP_NAME`: nome exibido no painel.

## Segurança

- Apenas usuários com `usuarios.tipo = admin` podem entrar.
- A sessão usa cookie `httpOnly`.
- APIs internas validam admin antes de retornar dados.
- Listas mascaram CPF, telefone e e-mail.
- Senhas, tokens e secrets nunca são retornados.

## Rotas

- `/login`
- `/dashboard`
- `/usuarios`
- `/prestadores`
- `/pendencias`
- `/assinaturas`
- `/email`
- `/logs`
- `/configuracoes`

## Escopo desta etapa

O painel não implementa pagamento real, não integra Asaas e não altera o schema principal. O Prisma schema local é uma cópia do schema do `server` para gerar o client do controlador.
