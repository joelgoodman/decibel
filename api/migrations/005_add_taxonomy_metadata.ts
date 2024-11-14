import type { QueryFunction } from '../types/database';

export const name = '005_add_taxonomy_metadata';

export async function up(query: QueryFunction) {
  // Add metadata column to taxonomies table
  await query(`
    ALTER TABLE taxonomies
    ADD COLUMN description TEXT,
    ADD COLUMN color TEXT,
    ADD COLUMN icon TEXT
  `);

  // Add taxonomy settings table for publication-specific configuration
  await query(`
    CREATE TABLE taxonomy_settings (
      id TEXT PRIMARY KEY,
      publication_id TEXT NOT NULL,
      type TEXT NOT NULL,
      is_required BOOLEAN DEFAULT false,
      max_items INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publication_id) REFERENCES publications (id) ON DELETE CASCADE,
      UNIQUE(publication_id, type)
    )
  `);

  // Add index for faster lookups
  await query(`
    CREATE INDEX idx_taxonomy_settings_publication 
    ON taxonomy_settings(publication_id)
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_taxonomy_settings_publication');
  await query('DROP TABLE IF EXISTS taxonomy_settings');
  await query('ALTER TABLE taxonomies DROP COLUMN description');
  await query('ALTER TABLE taxonomies DROP COLUMN color');
  await query('ALTER TABLE taxonomies DROP COLUMN icon');
}