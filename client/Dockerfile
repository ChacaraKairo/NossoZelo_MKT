FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Expõe a porta do Next.js
EXPOSE 3000

# No modo desenvolvimento, o Next.js suporta hot reload mesmo no Docker
CMD ["npm", "run", "dev"]
