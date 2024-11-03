import { PrismaClient } from '@prisma/client'

interface ConnectionResult {
  success: boolean
  message: string
}

export function buildConnectionString(
  provider: 'neon' | 'supabase',
  settings: any
): string {
  if (provider === 'neon') {
    return `postgres://${settings.username}:${settings.password}@${settings.host}/${settings.database}?sslmode=${settings.sslMode}`
  } else {
    const poolingParam = settings.pooling ? '?pgbouncer=true' : ''
    return `postgres://${settings.username}:${settings.password}@${settings.host}:6543/${settings.database}${poolingParam}`
  }
}

export async function testDatabaseConnection(connectionString: string): Promise<ConnectionResult> {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  })

  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()

    return {
      success: true,
      message: 'Successfully connected to the database',
    }
  } catch (error) {
    await prisma.$disconnect()
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to database',
    }
  }
}