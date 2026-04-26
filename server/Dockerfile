# Estágio de construção e execução
FROM node:20-slim

# Instalar dependências para o Prisma e utilitários
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências e gerar o cliente Prisma
RUN npm ci
RUN npx prisma generate

# Copiar o restante do código
COPY . .

# Expor a porta definida no seu .env (4000)
EXPOSE 4000

# Comando para iniciar (usando o script dev ou start dependendo do ambiente)
CMD ["npm", "run", "dev"]
