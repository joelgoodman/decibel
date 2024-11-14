import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { publicationRoutes } from './routes/publications';
import { contentRoutes } from './routes/content';
import { taxonomyRoutes } from './routes/taxonomies';
import { healthRoutes } from './routes/health';
import { runMigrations } from './lib/migrations';
import { errorHandler } from './middleware/error';
import { rateLimiters, securityHeaders, serverLoadProtection } from './middleware/security';
import { requestMetrics, databaseMetrics } from './middleware/metrics';
import { initializeObservability } from './lib/observability';
import { logger } from './lib/logger';

const app = express();

// Initialize observability
initializeObservability().catch(error => {
  logger.error('Failed to initialize observability:', error);
});

// Security middleware
app.use(securityHeaders);
app.use(serverLoadProtection);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json());
app.use(cookieParser());

// Metrics middleware
app.use(requestMetrics);
app.use(databaseMetrics);

// Rate limiting
app.use(rateLimiters.api);
app.use('/api/auth', rateLimiters.auth);
app.use('/api/content', rateLimiters.content);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/taxonomies', taxonomyRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await runMigrations();
    logger.info('Database migrations completed successfully');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`API server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();