export interface DatabaseConnectionInfo {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

export function parseDatabaseUrl(): DatabaseConnectionInfo {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada.');
  }

  const url = new URL(databaseUrl);
  const database = url.pathname.replace(/^\//, '');

  if (!database) {
    throw new Error('DATABASE_URL não informa o nome do banco.');
  }

  return {
    host: url.hostname,
    port: url.port || '3306',
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  };
}
