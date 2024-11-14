import type { QueryFunction } from '../types/database';

export const name = '006_add_content_versions';

export async function up(query: QueryFunction) {
  // Create content versions table
  await query(`
    CREATE TABLE content_versions (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      blocks TEXT NOT NULL DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
      UNIQUE(content_id, version)
    )
  `);

  // Add indexes for efficient querying
  await query(`
    CREATE INDEX idx_content_versions_content 
    ON content_versions(content_id)
  `);

  await query(`
    CREATE INDEX idx_content_versions_version 
    ON content_versions(content_id, version)
  `);

  // Add version column to content table if not exists
  await query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content' AND column_name = 'version'
      ) THEN
        ALTER TABLE content ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
      END IF;
    END $$;
  `);

  // Create initial versions for existing content
  await query(`
    INSERT INTO content_versions (
      id, content_id, version, title, blocks, metadata, created_by
    )
    SELECT 
      gen_random_uuid(), 
      id, 
      1, 
      title, 
      blocks, 
      metadata, 
      author_id
    FROM content
    WHERE NOT EXISTS (
      SELECT 1 FROM content_versions WHERE content_id = content.id
    )
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_content_versions_version');
  await query('DROP INDEX IF EXISTS idx_content_versions_content');
  await query('DROP TABLE IF EXISTS content_versions');
  
  // Remove version column from content table
  await query(`
    ALTER TABLE content DROP COLUMN IF EXISTS version
  `);
}