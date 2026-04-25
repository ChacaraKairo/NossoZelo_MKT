type LogData = unknown;

const PREFIX = '[NOSSOZELO-FRONT]';
const isProduction = process.env.NODE_ENV === 'production';

function formatarMensagem(
  nivel: string,
  contexto: string,
  mensagem: string,
) {
  return `${PREFIX} [${nivel}] [${contexto}] ${mensagem}`;
}

export const logger = {
  info(contexto: string, mensagem: string, dados?: LogData) {
    if (isProduction) return;
    console.info(
      formatarMensagem('INFO', contexto, mensagem),
      dados ?? '',
    );
  },

  warn(contexto: string, mensagem: string, dados?: LogData) {
    console.warn(
      formatarMensagem('WARN', contexto, mensagem),
      dados ?? '',
    );
  },

  error(contexto: string, mensagem: string, erro?: LogData) {
    console.error(
      formatarMensagem('ERROR', contexto, mensagem),
      erro ?? '',
    );
  },

  debug(contexto: string, mensagem: string, dados?: LogData) {
    if (isProduction) return;
    console.debug(
      formatarMensagem('DEBUG', contexto, mensagem),
      dados ?? '',
    );
  },
};

export default logger;
