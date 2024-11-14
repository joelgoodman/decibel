import type { QueryFunction } from '../types/database';

export const name = '007_add_cache_table';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE cache_entries (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE INDEX idx_cache_expires 
    ON cache_entries(expires_at)
    WHERE expires_at > CURRENT_TIMESTAMP
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_cache_expires');
  await query('DROP TABLE IF EXISTS cache_entries');
}