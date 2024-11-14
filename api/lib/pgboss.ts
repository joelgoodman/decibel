import PgBoss from 'pg-boss';
import { pool } from './db';

// PgBoss configuration
const pgboss = new PgBoss({
  db: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients
  application_name: 'pgboss',
  retryLimit: 5,
  retentionDays: 7,
  monitorStateIntervalMinutes: 1
});

// Initialize PgBoss
pgboss.on('error', error => console.error('PgBoss error:', error));

export async function initializePgBoss() {
  try {
    await pgboss.start();
    console.log('PgBoss started successfully');
  } catch (error) {
    console.error('Failed to start PgBoss:', error);
    throw error;
  }
}

// Cache implementation using PostgreSQL
export class PgCache {
  private static instance: PgCache;
  private readonly tableName = 'cache_entries';
  private readonly defaultTTL = 300; // 5 minutes in seconds

  private constructor() {
    this.initializeTable();
  }

  static getInstance(): PgCache {
    if (!PgCache.instance) {
      PgCache.instance = new PgCache();
    }
    return PgCache.instance;
  }

  private async initializeTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_cache_expires 
      ON ${this.tableName}(expires_at)
      WHERE expires_at > CURRENT_TIMESTAMP
    `);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await pool.query(
        `SELECT value 
         FROM ${this.tableName}
         WHERE key = $1 
         AND expires_at > CURRENT_TIMESTAMP`,
        [key]
      );

      return result.rows[0]?.value || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl = this.defaultTTL): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO ${this.tableName} (key, value, expires_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP + interval '1 second' * $3)
         ON CONFLICT (key) 
         DO UPDATE SET 
           value = EXCLUDED.value,
           expires_at = EXCLUDED.expires_at`,
        [key, value, ttl]
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      await pool.query(
        `DELETE FROM ${this.tableName} 
         WHERE key LIKE $1`,
        [`%${pattern}%`]
      );
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await pool.query(`TRUNCATE TABLE ${this.tableName}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    try {
      await pool.query(
        `DELETE FROM ${this.tableName} 
         WHERE expires_at <= CURRENT_TIMESTAMP`
      );
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

// Job queue implementation using PgBoss
export class JobQueue {
  static async addJob(
    queue: string,
    data: any,
    options: PgBoss.SendOptions = {}
  ): Promise<string> {
    return pgboss.send(queue, data, options);
  }

  static async processJobs(
    queue: string,
    handler: (job: PgBoss.Job) => Promise<void>
  ): Promise<void> {
    pgboss.work(queue, handler);
  }

  static async scheduleJob(
    queue: string,
    data: any,
    cron: string,
    options: PgBoss.SendOptions = {}
  ): Promise<string> {
    return pgboss.schedule(queue, cron, data, options);
  }

  static async cancelJob(jobId: string): Promise<boolean> {
    return pgboss.cancel(jobId);
  }
}

// Export singleton instances
export const cache = PgCache.getInstance();
export const jobQueue = JobQueue;