# 🛠️ Projeto Node.js + TypeScript – Estrutura Base

Este projeto oferece uma base robusta para a criação de APIs modernas com Node.js e TypeScript. Ele inclui autenticação JWT/OAuth2, ORM com Prisma, WebSocket, envio de e-mails, integração com pagamentos e muito mais.

---

## ✅ Instalação Rápida

```bash
npm install
```

Em seguida, crie um arquivo `.env` com suas configurações de ambiente.

---

## 📦 Pacotes e Módulos Utilizados

### 🌐 Backend Express + TypeScript

```bash
npm install express
npm install typescript ts-node-dev nodemon --save-dev
npm install @types/node @types/express
```

- **express**: Framework web para criação da API.
- **ts-node-dev**: Hot reload para ambiente de desenvolvimento.
- \*\*@types/- **@types/\u\***: Tipagens para compatibilidade com TypeScript.

### 🔐 Autenticação (JWT e OAuth2)

```bash
npm install jsonwebtoken bcrypt
npm install @types/jsonwebtoken @types/bcrypt
npm install passport passport-jwt passport-google-oauth20
npm install @types/passport @types/passport-jwt @types/passport-google-oauth20
```

- **JWT + Bcrypt**: Login seguro com tokens.
- **Passport**: Middleware de autenticação.
- **OAuth2**: Login social (Google etc).

### 🛢 ORM + Banco de Dados (Prisma + MySQL)

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
npx prisma db pull
npx prisma generate
```

- **Prisma**: ORM moderno com autocompletar.
- **MySQL**: Banco de dados relacional.

### 📄 Validação e DTO

```bash
npm install validator
npm install @types/validator
```

- **validator**: Validação de e-mail, cpf, cep, etc.

### 🧰 Middlewares e Segurança

```bash
npm install cors helmet morgan
npm install @types/cors @types/morgan
```

- **CORS**: Permitir requisições entre domínios.
- **Helmet**: Headers HTTP seguros.
- **Morgan**: Logger de requisições.

### 🌍 Variáveis de Ambiente

```bash
npm install dotenv
```

- **dotenv**: Gerenciar variáveis como JWT_SECRET, DB_URL, etc.

### 🔐 Cookies & Parser

```bash
npm install cookie-parser
npm install @types/cookie-parser
```

- **cookie-parser**: Leitura de cookies para sessões e tokens.

### 🎯 Upload de Arquivos

```bash
npm install multer
npm install @types/multer
```

- Upload de fotos, documentos e perfis.

### 💬 WebSocket (Notificações e Chat)

```bash
npm install socket.io
npm install @types/socket.io
```

- Envio de mensagens em tempo real (chat, alertas, etc).

### 💸 Integração com Pagamentos (Mercado Pago)

```bash
npm install mercadopago
```

- Integração direta com a API do Mercado Pago.

### 🔑 NanoID

```bash
npm install nanoid
npm install @types/nanoid
```

- Gerar IDs curtos e seguros para recursos e tokens.

### 📧 Envio de E-mails

```bash
npm install nodemailer
npm install @types/nodemailer
```

- Envio de e-mails com templates HTML (cadastro, redefinição de senha, etc).

### 📝 Logging Avançado

```bash
npm install winston
```

- Logging estruturado, persistente e configurável.

---

## 🧠 Scripts no package.json

```json
"scripts": {
  "start": "ts-node src/server.ts",
  "dev": "nodemon --watch src --ext ts,json --exec ts-node-dev src/server.ts",
  "test": "echo \"No test specified\" && exit 0"
}
```

---

## 📍 Licença e Termos de Uso – Projeto NossoZelo

> **Copyright © 2025** > **Kairo Esteves Pinheiro Chácara - NossoZelo**

Este projeto é **proprietário** e disponibilizado apenas para **visualização e estudo**.

### ❌ Restrições:

- É **proibido** copiar, modificar, redistribuir, sublicenciar, aplicar engenharia reversa ou reutilizar o código sem **autorização prévia por escrito**.

### 📩 Licenciamento:

Para uso comercial ou integração:
**[kairoepc2@gmail.com](mailto:kairoepc2@gmail.com)**

> O software é fornecido "no estado em que se encontra", **sem garantias de qualquer tipo**, expressas ou implícitas.
