Instruções para o docker, banco PostgreSQL e Prisma

docker pull postgres:16-alpine

docker run --name nossozelo_db2 -e POSTGRES_DB=nossozelo -e POSTGRES_USER=nossozelo -e POSTGRES_PASSWORD=nossozelo123 -d -p 5433:5432 postgres:16-alpine

--name nossozelo_db2: Define o nome do contêiner como nossozelo_db2.

-e POSTGRES_PASSWORD=nossozelo123: Define a senha do usuário PostgreSQL. Substitua por uma senha segura.

-d: Executa o contêiner em segundo plano (modo "detached").

-p 5433:5432: Mapeia a porta 5432 do contêiner para a porta 5433 do host. Isso permite que você se conecte ao PostgreSQL a partir do seu sistema host sem conflitar com um PostgreSQL local.

postgres:16-alpine: Especifica a imagem do PostgreSQL a ser usada.
