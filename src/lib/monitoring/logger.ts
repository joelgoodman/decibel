import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
})

export default logger

export const logRequest = logger.child({ component: 'http' })
export const logDatabase = logger.child({ component: 'database' })
export const logAuth = logger.child({ component: 'auth' })
export const logEmail = logger.child({ component: 'email' })
export const logJob = logger.child({ component: 'job' })