# ðŸ› ï¸ Projeto Node.js + TypeScript â€“ Estrutura Base

Este projeto oferece uma base robusta para a criaÃ§Ã£o de APIs modernas com Node.js e TypeScript. Ele inclui autenticaÃ§Ã£o JWT/OAuth2, ORM com Prisma, WebSocket, envio de e-mails, integraÃ§Ã£o com pagamentos e muito mais.

---

## âœ… InstalaÃ§Ã£o RÃ¡pida

```bash
npm install
```

Em seguida, crie um arquivo `.env` com suas configuraÃ§Ãµes de ambiente.

---

## ðŸ“¦ Pacotes e MÃ³dulos Utilizados

### ðŸŒ Backend Express + TypeScript

```bash
npm install express
npm install typescript ts-node-dev nodemon --save-dev
npm install @types/node @types/express
```

- **express**: Framework web para criaÃ§Ã£o da API.
- **ts-node-dev**: Hot reload para ambiente de desenvolvimento.
- \*\*@types/- **@types/\u\***: Tipagens para compatibilidade com TypeScript.

### ðŸ” AutenticaÃ§Ã£o (JWT e OAuth2)

```bash
npm install jsonwebtoken bcrypt
npm install @types/jsonwebtoken @types/bcrypt
npm install passport passport-jwt passport-google-oauth20
npm install @types/passport @types/passport-jwt @types/passport-google-oauth20
```

- **JWT + Bcrypt**: Login seguro com tokens.
- **Passport**: Middleware de autenticaÃ§Ã£o.
- **OAuth2**: Login social (Google etc).

### ðŸ›¢ ORM + Banco de Dados (Prisma + MySQL)

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
npx prisma db pull
npx prisma generate
```

- **Prisma**: ORM moderno com autocompletar.
- **MySQL**: Banco de dados relacional.

### ðŸ“„ ValidaÃ§Ã£o e DTO

```bash
npm install validator
npm install @types/validator
```

- **validator**: ValidaÃ§Ã£o de e-mail, cpf, cep, etc.

### ðŸ§° Middlewares e SeguranÃ§a

```bash
npm install cors helmet morgan
npm install @types/cors @types/morgan
```

- **CORS**: Permitir requisiÃ§Ãµes entre domÃ­nios.
- **Helmet**: Headers HTTP seguros.
- **Morgan**: Logger de requisiÃ§Ãµes.

### ðŸŒ VariÃ¡veis de Ambiente

```bash
npm install dotenv
```

- **dotenv**: Gerenciar variÃ¡veis como JWT_SECRET, DB_URL, etc.

### ðŸ” Cookies & Parser

```bash
npm install cookie-parser
npm install @types/cookie-parser
```

- **cookie-parser**: Leitura de cookies para sessÃµes e tokens.

### ðŸŽ¯ Upload de Arquivos

```bash
npm install multer
npm install @types/multer
```

- Upload de fotos, documentos e perfis.

### ðŸ’¬ WebSocket (NotificaÃ§Ãµes e Chat)

```bash
npm install socket.io
npm install @types/socket.io
```

- Envio de mensagens em tempo real (chat, alertas, etc).

### Integração com Pagamentos (Asaas)

- Assinaturas de prestadores usam cobrança/link/Pix via Asaas.
- O NossoZelo não coleta cartão diretamente nesta etapa.

### ðŸ”‘ NanoID

```bash
npm install nanoid
npm install @types/nanoid
```

- Gerar IDs curtos e seguros para recursos e tokens.

### ðŸ“§ Envio de E-mails

```bash
npm install nodemailer
npm install @types/nodemailer
```

- Envio de e-mails com templates HTML (cadastro, redefiniÃ§Ã£o de senha, etc).

### ðŸ“ Logging AvanÃ§ado

```bash
npm install winston
```

- Logging estruturado, persistente e configurÃ¡vel.

---

## ðŸ§  Scripts no package.json

```json
"scripts": {
  "start": "ts-node src/server.ts",
  "dev": "nodemon --watch src --ext ts,json --exec ts-node-dev src/server.ts",
  "test": "echo \"No test specified\" && exit 0"
}
```

---

## ðŸ“ LicenÃ§a e Termos de Uso â€“ Projeto NossoZelo

> **Copyright Â© 2025** > **Kairo Esteves Pinheiro ChÃ¡cara - NossoZelo**

Este projeto Ã© **proprietÃ¡rio** e disponibilizado apenas para **visualizaÃ§Ã£o e estudo**.

### âŒ RestriÃ§Ãµes:

- Ã‰ **proibido** copiar, modificar, redistribuir, sublicenciar, aplicar engenharia reversa ou reutilizar o cÃ³digo sem **autorizaÃ§Ã£o prÃ©via por escrito**.

### ðŸ“© Licenciamento:

Para uso comercial ou integraÃ§Ã£o:
**[kairoepc2@gmail.com](mailto:kairoepc2@gmail.com)**

> O software Ã© fornecido "no estado em que se encontra", **sem garantias de qualquer tipo**, expressas ou implÃ­citas.

