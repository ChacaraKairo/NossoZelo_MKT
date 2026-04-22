/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Ponto de entrada e configuração principal do servidor Express, responsável pelo
 * carregamento de variáveis de ambiente, definição de políticas de CORS, acoplamento de
 * middlewares globais e orquestração de rotas e arquivos estáticos.
 * @rota server\src\main.ts
 */

import express from 'express';
import morgan from 'morgan';
import path from 'path';
import routes from './src/route/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

console.log(
  '[LOG-FLUXO] Iniciando carregamento das configurações de ambiente via dotenv.',
);
dotenv.config();

const app = express();

// Configuração de segurança de origens
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
).split(',');

console.log(
  `[LOG-FLUXO] Configurando política de CORS. Origens permitidas no whitelist: ${allowedOrigins.join(
    ', ',
  )}`,
);

/**
 * Middleware de CORS com lógica de validação dinâmica e logs de interceptação.
 */
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(
        `[LOG-FLUXO] Verificando permissão de CORS para a origem: ${
          origin ||
          'Sem Origem (Request Direta/Postman/Curl)'
        }`,
      );

      // Permite requisições sem origem (como ferramentas de debug)
      if (!origin) {
        console.log(
          '[LOG-FLUXO] Origem não detectada. Acesso permitido via política de exceção para clientes não-browser.',
        );
        return callback(null, true);
      }

      // Validação contra whitelist
      if (allowedOrigins.includes(origin)) {
        console.log(
          `[LOG-FLUXO] Origem '${origin}' autorizada com sucesso pelo middleware de segurança.`,
        );
        callback(null, true);
      } else {
        console.warn(
          `[ERRO-FLUXO] Bloqueio de CORS: A origem '${origin}' não consta na lista de permissões configurada no servidor.`,
        );
        callback(new Error('Not allowed by CORS'));
      }
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

console.log(
  '[LOG-FLUXO] Acoplando middlewares globais: cookie-parser, morgan (dev) e express.json.',
);
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());

/**
 * Rota de Health Check para monitoramento de disponibilidade (Observabilidade).
 */
app.get('/api/health', (req, res) => {
  console.log(
    '[LOG-FLUXO] Requisição de Health Check recebida na rota /api/health.',
  );

  const healthStatus = {
    status: 'healthy',
    message: 'API do Nosso Zelo está operacional',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  console.log(
    `[LOG-FLUXO] Retornando status de integridade do sistema: ${healthStatus.status}`,
  );
  res.status(200).json(healthStatus);
});

// ==========================================
// CONFIGURAÇÃO DE ARQUIVOS ESTÁTICOS
// ==========================================
console.log(
  '[LOG-FLUXO] Iniciando mapeamento de diretórios de arquivos estáticos.',
);

// Resolução do caminho para arquivos HTML
const htmlPath = path.join(__dirname, 'HTML');
console.log(
  `[LOG-FLUXO] Servindo recursos estáticos do diretório HTML: ${htmlPath}`,
);
app.use(express.static(htmlPath));

// Configuração para servir uploads (fotos/documentos) para o cliente
const uploadsPath = path.join(__dirname, '../uploads');
console.log(
  `[LOG-FLUXO] Mapeando endpoint /uploads para o diretório físico: ${uploadsPath}`,
);
app.use('/uploads', express.static(uploadsPath));

/**
 * Rota Raiz: Serve o arquivo de entrada da interface web (index.html).
 */
app.get('/', (req, res) => {
  console.log(
    "[LOG-FLUXO] Rota raiz ('/') acessada. Iniciando fluxo de envio do SPA/Index.",
  );

  const filePath = path.join(
    __dirname,
    'HTML',
    'index.html',
  );

  console.log(
    `[LOG-FLUXO] Localização do arquivo de entrada resolvida: ${filePath}. Despachando arquivo para o cliente.`,
  );
  res.sendFile(filePath);
});

// ==========================================
// ROTEAMENTO PRINCIPAL
// ==========================================
console.log(
  '[LOG-FLUXO] Acoplando o roteador principal indexado no prefixo /nossozelo.',
);
app.use('/nossozelo', routes);

console.log(
  '[LOG-FLUXO] Configuração do App Express finalizada com sucesso. Servidor pronto para escuta.',
);

export default app;
