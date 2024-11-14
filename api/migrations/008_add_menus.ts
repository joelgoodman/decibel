import type { QueryFunction } from '../types/database';

export const name = '008_add_menus';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE menus (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);

  await query(`
    CREATE INDEX idx_menus_location 
    ON menus(location) 
    WHERE deleted_at IS NULL
  `);

  // Insert default menus
  await query(`
    INSERT INTO menus (id, name, location, items)
    VALUES 
      ($1, 'Primary Navigation', 'header', '[]'),
      ($2, 'Footer Menu', 'footer', '[]')
  `, [
    randomUUID(),
    randomUUID()
  ]);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_menus_location');
  await query('DROP TABLE IF EXISTS menus');
}