import winston from 'winston';

const CHAVES_SENSIVEIS = [
  'senha',
  'novaSenha',
  'password',
  'token',
  'headers',
  'cookie',
  'cpf',
  'cpfCnpj',
  'telefone',
  'phone',
  'email',
  'cartao',
  'card',
  'cvv',
  'bank',
  'banco',
  'agencia',
  'conta',
  'dados_bancarios',
  'authorization',
  'apiKey',
  'api_key',
  'secret',
  'EMAIL_PASS',
  'ASAAS_API_KEY',
];

function mascararEmail(valor: string) {
  return valor.replace(
    /([A-Z0-9._%+-]{2})[A-Z0-9._%+-]*(@[A-Z0-9.-]+\.[A-Z]{2,})/gi,
    '$1***$2',
  );
}

function sanitizar(valor: unknown): unknown {
  if (valor instanceof Error) {
    return {
      name: valor.name,
      message: valor.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : valor.stack,
    };
  }

  if (typeof valor === 'string') {
    return mascararEmail(valor);
  }

  if (Array.isArray(valor)) {
    return valor.map(sanitizar);
  }

  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor as Record<string, unknown>).map(([chave, item]) => {
        const chaveSensivel = CHAVES_SENSIVEIS.some((sensivel) =>
          chave.toLowerCase().includes(sensivel.toLowerCase()),
        );

        return [chave, chaveSensivel ? '[REDACTED]' : sanitizar(item)];
      }),
    );
  }

  return valor;
}

const sanitizarFormato = winston.format((info) => {
  for (const chave of Object.keys(info)) {
    if (!['level', 'message', 'timestamp'].includes(chave)) {
      info[chave] = sanitizar(info[chave]);
    }
  }

  if (typeof info.message === 'string') {
    info.message = mascararEmail(info.message);
  }

  return info;
});

const formatoConsole = winston.format.printf(
  ({ level, message, timestamp, service, ...meta }) => {
    const dados =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    return `[${service}] [${timestamp}] [${level.toUpperCase()}] ${message}${dados}`;
  },
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'NOSSOZELO-BACK' },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    sanitizarFormato(),
    process.env.LOG_FORMAT === 'json'
      ? winston.format.json()
      : formatoConsole,
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
