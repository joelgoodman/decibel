import type { QueryFunction } from '../types/database';

export const name = '003_add_taxonomies';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE taxonomies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      type TEXT NOT NULL,
      publication_id TEXT NOT NULL,
      parent_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      FOREIGN KEY (publication_id) REFERENCES publications (id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES taxonomies (id) ON DELETE CASCADE,
      UNIQUE(publication_id, type, slug)
    )
  `);

  await query(`
    CREATE TABLE content_taxonomies (
      content_id TEXT NOT NULL,
      taxonomy_id TEXT NOT NULL,
      order_position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (content_id, taxonomy_id),
      FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE,
      FOREIGN KEY (taxonomy_id) REFERENCES taxonomies (id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE INDEX idx_taxonomies_publication 
    ON taxonomies(publication_id, type) 
    WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_taxonomies_parent 
    ON taxonomies(parent_id) 
    WHERE parent_id IS NOT NULL
  `);

  await query(`
    CREATE INDEX idx_content_taxonomies_taxonomy 
    ON content_taxonomies(taxonomy_id)
  `);

  await query(`
    CREATE INDEX idx_content_taxonomies_order 
    ON content_taxonomies(taxonomy_id, order_position)
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_content_taxonomies_order');
  await query('DROP INDEX IF EXISTS idx_content_taxonomies_taxonomy');
  await query('DROP INDEX IF EXISTS idx_taxonomies_parent');
  await query('DROP INDEX IF EXISTS idx_taxonomies_publication');
  await query('DROP TABLE IF EXISTS content_taxonomies');
  await query('DROP TABLE IF EXISTS taxonomies');
}