import type { QueryFunction } from '../types/database';

export const name = '009_add_user_profile';

export async function up(query: QueryFunction) {
  await query(`
    ALTER TABLE users
    ADD COLUMN avatar TEXT,
    ADD COLUMN preferences JSONB NOT NULL DEFAULT '{
      "emailNotifications": true,
      "twoFactorEnabled": false,
      "theme": "system",
      "timezone": "UTC"
    }',
    ADD COLUMN last_login_at TIMESTAMP,
    ADD COLUMN two_factor_secret TEXT,
    ADD COLUMN two_factor_recovery_codes TEXT[]
  `);
}

export async function down(query: QueryFunction) {
  await query(`
    ALTER TABLE users
    DROP COLUMN avatar,
    DROP COLUMN preferences,
    DROP COLUMN last_login_at,
    DROP COLUMN two_factor_secret,
    DROP COLUMN two_factor_recovery_codes
  `);
}