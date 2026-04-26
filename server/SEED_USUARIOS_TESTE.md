# Seed de usuários para testes manuais

Este seed cria dados realistas para testar o site Nosso Zelo manualmente.

## Comando

No diretório `server/`:

```bash
npm run db:seed:test-users
```

## Credenciais criadas

Todos os usuários usam a mesma senha:

```txt
123456
```

Os e-mails seguem o padrão:

```txt
exemplo1@gmail.com
exemplo2@gmail.com
...
exemplo50@gmail.com
```

## Distribuição

- `exemplo1@gmail.com` até `exemplo20@gmail.com`: clientes
- `exemplo21@gmail.com` até `exemplo30@gmail.com`: cuidadores
- `exemplo31@gmail.com` até `exemplo40@gmail.com`: enfermeiros
- `exemplo41@gmail.com` até `exemplo50@gmail.com`: acompanhantes

## Dados incluídos

O script cria ou atualiza:

- usuários com nome, CPF, telefone, data de nascimento e endereço realistas
- localização para busca por distância
- perfis profissionais para cuidadores, enfermeiros e acompanhantes
- serviços de prestadores com valores por hora e diária
- agenda inicial dos prestadores
- contratações de exemplo com status variados
- avaliações para algumas contratações concluídas

## Segurança

O script é idempotente e usa `upsert`, então pode ser executado mais de uma vez sem duplicar os 50 usuários principais.

Ele não apaga dados existentes.

Antes de rodar, confirme que `server/.env` aponta para o banco correto em `DATABASE_URL`. No ambiente atual, o `.env` está apontando para `localhost:3306`; o seed só vai inserir dados quando esse banco estiver rodando e acessível.
