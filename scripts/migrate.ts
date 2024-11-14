import 'dotenv/config';
import { runMigrations, rollbackMigration, getMigrationStatus } from '../api/lib/migrations';

async function main() {
  const command = process.argv[2] || 'up';

  try {
    switch (command) {
      case 'up':
        await runMigrations();
        console.log('Migrations completed successfully');
        break;

      case 'rollback':
        const batch = process.argv[3] ? parseInt(process.argv[3]) : undefined;
        await rollbackMigration(batch);
        console.log('Rollback completed successfully');
        break;

      case 'status':
        const status = await getMigrationStatus();
        console.log('\nMigration Status:');
        console.log('-----------------');
        
        console.log('\nExecuted Migrations:');
        status.executed.forEach(migration => {
          console.log(`  ✓ ${migration.name} (Batch ${migration.batch})`);
        });

        console.log('\nPending Migrations:');
        if (status.pending.length === 0) {
          console.log('  No pending migrations');
        } else {
          status.pending.forEach(name => {
            console.log(`  • ${name}`);
          });
        }
        break;

      default:
        console.error('Unknown command. Use: up, rollback, or status');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();