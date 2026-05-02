import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import routes from './src/route/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './src/lib/logger';
import helmet from 'helmet';

dotenv.config();

const app = express();
const APP_NAME = process.env.APP_NAME || 'Nosso Zelo API';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const isProduction = process.env.NODE_ENV === 'production';

function validarAmbiente() {
  const jwtSecret = process.env.JWT_SECRET || '';

  if (!jwtSecret || jwtSecret.length < 32 || jwtSecret === 'secret') {
    throw new Error('JWT_SECRET ausente ou fraco. Use pelo menos 32 caracteres.');
  }

  const obrigatoriasProducao = [
    'DATABASE_URL',
    'ALLOWED_ORIGINS',
    'FRONTEND_URL',
    'BACKEND_PUBLIC_URL',
  ];

  if (isProduction) {
    const ausentes = obrigatoriasProducao.filter((name) => !process.env[name]);
    if (ausentes.length > 0) {
      throw new Error(
        `Variaveis obrigatorias ausentes em producao: ${ausentes.join(', ')}.`,
      );
    }
  }

  if (process.env.PAYMENT_GATEWAY === 'asaas' && !process.env.ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY e obrigatorio quando PAYMENT_GATEWAY=asaas.');
  }

  if (process.env.ENABLE_UPLOADS === 'true') {
    const awsVars = [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_PUBLIC_BUCKET_NAME',
      'AWS_PRIVATE_BUCKET_NAME',
    ];
    const ausentes = awsVars.filter((name) => !process.env[name]);
    if (ausentes.length > 0) {
      throw new Error(
        `Variaveis AWS obrigatorias ausentes: ${ausentes.join(', ')}.`,
      );
    }
  }
}

validarAmbiente();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || (isProduction ? '' : 'http://localhost:3000')
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

logger.info('App: CORS configurado', { allowedOrigins });

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        logger.debug('CORS: origem ausente permitida');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        logger.debug('CORS: origem autorizada', { origin });
        return callback(null, true);
      }

      logger.warn('CORS: origem bloqueada', { origin });
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: APP_NAME,
    message: 'API do Nosso Zelo está operacional',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: APP_NAME,
    timestamp: new Date().toISOString(),
  });
});

app.get('/nossozelo/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: APP_NAME,
    timestamp: new Date().toISOString(),
  });
});

const htmlPath = path.join(__dirname, 'HTML');
app.use(express.static(htmlPath));

// Documentos privados nao devem ser servidos como arquivos estaticos.
// Imagens publicas devem ser entregues por URLs controladas do storage.

app.get('/', (_req, res) => {
  const indexPath = path.join(__dirname, 'HTML', 'index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(200).json({
    status: 'healthy',
    name: APP_NAME,
    message: 'API do Nosso Zelo esta operacional',
    health: '/api/health',
    version: APP_VERSION,
  });
});

app.use('/nossozelo', routes);

logger.info('App: configuração concluída', {
  name: APP_NAME,
  version: APP_VERSION,
});

export default app;
