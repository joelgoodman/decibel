import { query, transaction } from './db';
import { randomUUID } from 'crypto';
import { ValidationError } from './validation/errors';

interface Migration {
  id: string;
  name: string;
  batch: number;
  executed_at: Date;
}

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      batch INTEGER NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(): Promise<Migration[]> {
  const result = await query(
    'SELECT id, name, batch, executed_at FROM migrations ORDER BY batch ASC, executed_at ASC'
  );
  return result.rows;
}

async function getLastBatchNumber(): Promise<number> {
  const result = await query('SELECT MAX(batch) as batch FROM migrations');
  return result.rows[0]?.batch || 0;
}

export async function runMigrations() {
  await ensureMigrationsTable();
  
  const executedMigrations = await getExecutedMigrations();
  const executedNames = new Set(executedMigrations.map(m => m.name));
  const currentBatch = await getLastBatchNumber();

  // Import all migration files
  const migrations = [
    require('../migrations/001_initial_schema'),
    require('../migrations/002_add_metadata'),
    require('../migrations/003_add_taxonomies'),
    require('../migrations/004_add_sessions'),
    require('../migrations/005_add_taxonomy_metadata'),
    require('../migrations/006_add_content_versions'),
    // Add new migrations here
  ];

  // Run pending migrations
  for (const migration of migrations) {
    if (!executedNames.has(migration.name)) {
      console.log(`Running migration: ${migration.name}`);
      
      await transaction(async (query) => {
        try {
          await migration.up(query);
          
          await query(
            `INSERT INTO migrations (id, name, batch) VALUES ($1, $2, $3)`,
            [randomUUID(), migration.name, currentBatch + 1]
          );
          
          console.log(`Migration completed: ${migration.name}`);
        } catch (error) {
          console.error(`Migration failed: ${migration.name}`, error);
          throw error;
        }
      });
    }
  }
}

export async function rollbackMigration(batch?: number) {
  const executedMigrations = await getExecutedMigrations();
  if (executedMigrations.length === 0) {
    console.log('No migrations to rollback');
    return;
  }

  const lastBatch = batch || executedMigrations[executedMigrations.length - 1].batch;
  const migrationsToRollback = executedMigrations
    .filter(m => m.batch === lastBatch)
    .reverse();

  for (const migration of migrationsToRollback) {
    console.log(`Rolling back migration: ${migration.name}`);
    
    await transaction(async (query) => {
      try {
        const migrationModule = require(`../migrations/${migration.name}`);
        await migrationModule.down(query);
        
        await query(
          'DELETE FROM migrations WHERE name = $1',
          [migration.name]
        );
        
        console.log(`Rollback completed: ${migration.name}`);
      } catch (error) {
        console.error(`Rollback failed: ${migration.name}`, error);
        throw error;
      }
    });
  }
}

export async function getMigrationStatus(): Promise<{
  executed: Migration[];
  pending: string[];
}> {
  const executedMigrations = await getExecutedMigrations();
  const executedNames = new Set(executedMigrations.map(m => m.name));
  
  const allMigrations = [
    '001_initial_schema',
    '002_add_metadata',
    '003_add_taxonomies',
    '004_add_sessions',
    '005_add_taxonomy_metadata',
    '006_add_content_versions'
  ];

  const pending = allMigrations.filter(name => !executedNames.has(name));

  return {
    executed: executedMigrations,
    pending
  };
}