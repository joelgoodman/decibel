import { Pool, PoolConfig, QueryResult } from 'pg';
import { ValidationError } from './validation/errors';

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : undefined,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Return client to pool after this many uses (prevents memory leaks)
};

const pool = new Pool(poolConfig);

// Error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Connection monitoring
pool.on('connect', () => {
  console.debug('New client connected to pool');
});

pool.on('remove', () => {
  console.debug('Client removed from pool');
});

interface QueryOptions {
  transaction?: boolean;
}

export async function query<T = any>(
  sql: string,
  params?: any[],
  options: QueryOptions = {}
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  
  try {
    if (options.transaction) {
      await client.query('BEGIN');
    }

    const result = await client.query<T>(sql, params);

    if (options.transaction) {
      await client.query('COMMIT');
    }

    return result;
  } catch (error) {
    if (options.transaction) {
      await client.query('ROLLBACK');
    }

    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes('duplicate key')) {
        throw new ValidationError('Resource already exists', [{
          path: [],
          message: 'A resource with these details already exists',
          code: 'DUPLICATE_KEY'
        }]);
      }

      if (error.message.includes('foreign key')) {
        throw new ValidationError('Invalid reference', [{
          path: [],
          message: 'Referenced resource does not exist',
          code: 'FOREIGN_KEY'
        }]);
      }
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function transaction<T>(
  callback: (query: typeof pool.query) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client.query.bind(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  try {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
    process.exit(1);
  }
});