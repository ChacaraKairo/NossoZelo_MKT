import express from 'express';
import morgan from 'morgan';
import path from 'path';
import routes from './src/route/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
).split(',');

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Ex: Postman, curl
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(
          `CORS bloqueado para origem: ${origin}`,
        );
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

// Rota de saúde da API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'API do Nosso Zelo está operacional',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ==========================================
// ARQUIVOS ESTÁTICOS (HTML E UPLOADS)
// ==========================================
// Serve a pasta HTML
app.use(express.static(path.join(__dirname, 'HTML')));

// 🔥 NOVO: Serve a pasta uploads para o frontend conseguir ver as fotos!
// O path resolve para sair da pasta 'src' e achar a pasta 'uploads' na raiz
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads')),
);

app.get('/', (req, res) => {
  const filePath = path.join(
    __dirname,
    'HTML',
    'index.html',
  );
  res.sendFile(filePath);
});

// Rotas principais
app.use('/nossozelo', routes);

export default app;
