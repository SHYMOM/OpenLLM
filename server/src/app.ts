import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { keysRouter } from './routes/keys.js';
import { modelsRouter } from './routes/models.js';
import { proxyRouter } from './routes/proxy.js';
import { fallbackRouter } from './routes/fallback.js';
import { analyticsRouter } from './routes/analytics.js';
import { healthRouter } from './routes/health.js';
import { settingsRouter } from './routes/settings.js';
import { chatsRouter } from './routes/chats.js';
import { authRouter } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false, hsts: false }));
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Public API routes
  app.use('/api/auth', authRouter);
  app.get('/api/ping', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Protected API routes
  app.use('/api', authMiddleware);
  app.use('/api/keys', keysRouter);
  app.use('/api/models', modelsRouter);
  app.use('/api/fallback', fallbackRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/chats', chatsRouter);

  // OpenAI-compatible proxy
  app.use('/v1', proxyRouter);

  // Error handler (for API routes)
  app.use(errorHandler);

  // Serve client static files
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/v1/')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  return app;
}
