import winston from 'winston';

const formato = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    const dados =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    return `[NOSSOZELO-BACK] [${timestamp}] [${level.toUpperCase()}] ${message}${dados}`;
  },
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    formato,
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
