import 'dotenv/config';
import { BackupService } from '../api/lib/backup';

async function main() {
  const command = process.argv[2] || 'create';
  const backupService = BackupService.getInstance();

  try {
    switch (command) {
      case 'create':
        console.log('Creating backup...');
        const result = await backupService.createBackup();
        console.log('Backup created successfully:', result);
        break;

      case 'verify':
        const filename = process.argv[3];
        if (!filename) {
          console.error('Please provide a backup filename to verify');
          process.exit(1);
        }
        console.log('Verifying backup...');
        const isValid = await backupService.verifyBackup(filename);
        console.log(isValid ? 'Backup is valid' : 'Backup verification failed');
        break;

      case 'list':
        const redis = (await import('../api/lib/redis')).redis;
        const backups = await redis.hGetAll('backup:metadata');
        console.log('\nAvailable Backups:');
        console.log('-----------------');
        Object.entries(backups)
          .map(([_, infoStr]) => JSON.parse(infoStr))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .forEach(backup => {
            console.log(`
Filename: ${backup.filename}
Timestamp: ${new Date(backup.timestamp).toLocaleString()}
Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB
Checksum: ${backup.checksum}
            `);
          });
        break;

      default:
        console.error('Unknown command. Use: create, verify, or list');
        process.exit(1);
    }
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

main();