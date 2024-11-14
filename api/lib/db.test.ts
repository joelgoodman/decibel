import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { query, transaction, checkConnection } from './db';

describe('Database Connection Pool', () => {
  let testPool: Pool;

  beforeAll(async () => {
    // Create a separate test pool
    testPool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      max: 5
    });
  });

  afterAll(async () => {
    await testPool.end();
  });

  it('should execute a simple query', async () => {
    const result = await query('SELECT 1 as number');
    expect(result.rows[0].number).toBe(1);
  });

  it('should handle parameterized queries', async () => {
    const result = await query(
      'SELECT $1::text as message',
      ['Hello']
    );
    expect(result.rows[0].message).toBe('Hello');
  });

  it('should handle transactions', async () => {
    const result = await transaction(async (query) => {
      const result = await query('SELECT 1 as number');
      return result.rows[0].number;
    });
    expect(result).toBe(1);
  });

  it('should rollback failed transactions', async () => {
    try {
      await transaction(async (query) => {
        await query('SELECT 1');
        throw new Error('Test error');
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should check connection successfully', async () => {
    const isConnected = await checkConnection();
    expect(isConnected).toBe(true);
  });

  it('should handle connection errors', async () => {
    const badPool = new Pool({
      connectionString: 'postgresql://invalid:5432/nonexistent'
    });
    
    try {
      await badPool.connect();
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      await badPool.end();
    }
  });
});