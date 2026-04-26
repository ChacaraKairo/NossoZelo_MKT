import express from 'express';
import morgan from 'morgan';
import path from 'path';
import routes from './src/route/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './src/lib/logger';

dotenv.config();

const app = express();
const APP_NAME = process.env.APP_NAME || 'Nosso Zelo API';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

logger.info('App: CORS configurado', { allowedOrigins });

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

const htmlPath = path.join(__dirname, 'HTML');
app.use(express.static(htmlPath));

const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

app.use('/nossozelo', routes);

logger.info('App: configuração concluída', {
  name: APP_NAME,
  version: APP_VERSION,
});

export default app;
