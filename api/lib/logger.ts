import pino from 'pino';
import * as Sentry from '@sentry/node';

// Configure Pino logger with custom serializers and formatters
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard'
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  },
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

// Initialize Sentry for error reporting
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: true }),
    new Sentry.Integrations.Postgres()
  ]
});

// Create a wrapper that logs and reports errors
export const errorLogger = {
  error(error: Error, context?: Record<string, any>) {
    logger.error({ err: error, ...context }, error.message);
    
    if (process.env.NODE_ENV !== 'development') {
      Sentry.captureException(error, {
        extra: context
      });
    }
  },

  warn(message: string, context?: Record<string, any>) {
    logger.warn(context, message);
    
    if (process.env.NODE_ENV !== 'development') {
      Sentry.captureMessage(message, 'warning');
    }
  },

  info(message: string, context?: Record<string, any>) {
    logger.info(context, message);
  },

  debug(message: string, context?: Record<string, any>) {
    logger.debug(context, message);
  }
};

// Export the base logger for direct use
export { logger };