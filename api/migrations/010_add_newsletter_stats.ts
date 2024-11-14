import type { QueryFunction } from '../types/database';

export const name = '010_add_newsletter_stats';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE newsletter_stats (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL REFERENCES content(id),
      sent_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT newsletter_stats_sent_count_check CHECK (sent_count >= 0),
      CONSTRAINT newsletter_stats_failed_count_check CHECK (failed_count >= 0)
    )
  `);

  await query(`
    CREATE INDEX idx_newsletter_stats_content 
    ON newsletter_stats(content_id)
  `);

  await query(`
    CREATE INDEX idx_newsletter_stats_date 
    ON newsletter_stats(created_at DESC)
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_newsletter_stats_date');
  await query('DROP INDEX IF EXISTS idx_newsletter_stats_content');
  await query('DROP TABLE IF EXISTS newsletter_stats');
}