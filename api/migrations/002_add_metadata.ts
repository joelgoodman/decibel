import type { QueryFunction } from '../types/database';

export const name = '002_add_metadata';

export async function up(query: QueryFunction) {
  await query(`
    ALTER TABLE users 
    ADD COLUMN metadata TEXT DEFAULT '{}'
  `);

  await query(`
    ALTER TABLE roles 
    ADD COLUMN metadata TEXT DEFAULT '{}'
  `);

  await query(`
    ALTER TABLE publications 
    ADD COLUMN metadata TEXT DEFAULT '{}'
  `);

  await query(`
    ALTER TABLE content 
    ADD COLUMN metadata TEXT DEFAULT '{}'
  `);
}

export async function down(query: QueryFunction) {
  await query('ALTER TABLE content DROP COLUMN metadata');
  await query('ALTER TABLE publications DROP COLUMN metadata');
  await query('ALTER TABLE roles DROP COLUMN metadata');
  await query('ALTER TABLE users DROP COLUMN metadata');
}