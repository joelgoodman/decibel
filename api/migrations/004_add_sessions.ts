import type { QueryFunction } from '../types/database';

export const name = '004_add_sessions';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_ip TEXT,
      last_used_at TIMESTAMP,
      last_used_ip TEXT,
      revoked_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE INDEX idx_sessions_user 
    ON sessions(user_id) 
    WHERE revoked_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_sessions_token 
    ON sessions(refresh_token) 
    WHERE revoked_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_sessions_expires 
    ON sessions(expires_at) 
    WHERE revoked_at IS NULL
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_sessions_expires');
  await query('DROP INDEX IF EXISTS idx_sessions_token');
  await query('DROP INDEX IF EXISTS idx_sessions_user');
  await query('DROP TABLE IF EXISTS sessions');
}