type LogData = unknown;

const PREFIX = '[NOSSOZELO-FRONT]';
const isProduction = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || (isProduction ? 'warn' : 'debug');
const ORDEM_NIVEIS = ['debug', 'info', 'warn', 'error'] as const;
type Nivel = (typeof ORDEM_NIVEIS)[number];

const CHAVES_SENSIVEIS = [
  'senha',
  'novaSenha',
  'password',
  'token',
  'authorization',
  'cpf',
  'email',
];

function nivelHabilitado(nivel: Nivel) {
  return ORDEM_NIVEIS.indexOf(nivel) >= ORDEM_NIVEIS.indexOf(LOG_LEVEL as Nivel);
}

function mascararTexto(valor: string) {
  return valor.replace(
    /([A-Z0-9._%+-]{2})[A-Z0-9._%+-]*(@[A-Z0-9.-]+\.[A-Z]{2,})/gi,
    '$1***$2',
  );
}

function sanitizar(dados: LogData): LogData {
  if (typeof dados === 'string') return mascararTexto(dados);
  if (dados instanceof Error) {
    return {
      name: dados.name,
      message: dados.message,
      stack: isProduction ? undefined : dados.stack,
    };
  }
  if (Array.isArray(dados)) return dados.map(sanitizar);
  if (dados && typeof dados === 'object') {
    return Object.fromEntries(
      Object.entries(dados as Record<string, unknown>).map(([chave, valor]) => {
        const sensivel = CHAVES_SENSIVEIS.some((item) =>
          chave.toLowerCase().includes(item.toLowerCase()),
        );

        return [chave, sensivel ? '[REDACTED]' : sanitizar(valor)];
      }),
    );
  }
  return dados;
}

function formatarMensagem(
  nivel: string,
  contexto: string,
  mensagem: string,
) {
  return `${PREFIX} [${nivel}] [${contexto}] ${mensagem}`;
}

export const logger = {
  info(contexto: string, mensagem: string, dados?: LogData) {
    if (!nivelHabilitado('info')) return;
    console.info(
      formatarMensagem('INFO', contexto, mensagem),
      sanitizar(dados) ?? '',
    );
  },

  warn(contexto: string, mensagem: string, dados?: LogData) {
    if (!nivelHabilitado('warn')) return;
    console.warn(
      formatarMensagem('WARN', contexto, mensagem),
      sanitizar(dados) ?? '',
    );
  },

  error(contexto: string, mensagem: string, erro?: LogData) {
    if (!nivelHabilitado('error')) return;
    console.error(
      formatarMensagem('ERROR', contexto, mensagem),
      sanitizar(erro) ?? '',
    );
  },

  debug(contexto: string, mensagem: string, dados?: LogData) {
    if (!nivelHabilitado('debug')) return;
    console.debug(
      formatarMensagem('DEBUG', contexto, mensagem),
      sanitizar(dados) ?? '',
    );
  },
};

export default logger;
