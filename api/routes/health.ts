import { Router } from 'express';
import { checkConnection } from '../lib/db';
import { redis } from '../lib/redis';
import { cacheService } from '../lib/cache';
import { logger } from '../lib/logger';
import {
  requestCounter,
  systemMemory,
  systemCpu
} from '../lib/observability';

const router = Router();

// Basic health check
router.get('/', async (req, res) => {
  requestCounter.add(1, { path: '/health', method: 'GET' });

  try {
    const dbHealthy = await checkConnection();
    const redisHealthy = redis.isReady;
    
    const health = {
      status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down'
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
});

// Detailed health metrics
router.get('/metrics', async (req, res) => {
  requestCounter.add(1, { path: '/health/metrics', method: 'GET' });

  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        memory: {
          used: process.memoryUsage(),
          total: systemMemory.bind({})
        },
        cpu: {
          usage: systemCpu.bind({})
        },
        uptime: process.uptime()
      },
      process: {
        pid: process.pid,
        version: process.version,
        memoryUsage: process.memoryUsage()
      }
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to collect metrics'
    });
  }
});

// Liveness probe
router.get('/liveness', (req, res) => {
  requestCounter.add(1, { path: '/health/liveness', method: 'GET' });
  res.status(200).json({ status: 'alive' });
});

// Readiness probe
router.get('/readiness', async (req, res) => {
  requestCounter.add(1, { path: '/health/readiness', method: 'GET' });

  try {
    const dbHealthy = await checkConnection();
    const redisHealthy = redis.isReady;
    const cacheHealthy = await cacheService.get('health-check');

    const ready = dbHealthy && redisHealthy;
    const statusCode = ready ? 200 : 503;

    res.status(statusCode).json({
      status: ready ? 'ready' : 'not ready',
      checks: {
        database: dbHealthy,
        redis: redisHealthy,
        cache: !!cacheHealthy
      }
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      error: 'Readiness check failed'
    });
  }
});

export const healthRoutes = router;