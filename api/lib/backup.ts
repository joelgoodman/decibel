import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { format } from 'date-fns';
import { redis } from './redis';

const execAsync = promisify(exec);

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BACKUP_BUCKET = process.env.BACKUP_BUCKET!;
const BACKUP_RETENTION_DAYS = 30;

interface BackupResult {
  filename: string;
  size: number;
  timestamp: Date;
  checksum: string;
}

export class BackupService {
  private static instance: BackupService;
  private backupInProgress = false;

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(): Promise<BackupResult> {
    if (this.backupInProgress) {
      throw new Error('Backup already in progress');
    }

    this.backupInProgress = true;
    const timestamp = new Date();
    const filename = `backup-${format(timestamp, 'yyyy-MM-dd-HH-mm-ss')}.sql`;

    try {
      // Create backup using pg_dump
      const { stdout } = await execAsync(
        `PGPASSWORD=${process.env.DATABASE_PASSWORD} pg_dump -h ${process.env.DATABASE_HOST} -U ${process.env.DATABASE_USER} -d ${process.env.DATABASE_NAME} -F c -b -v -f ${filename}`
      );

      // Calculate checksum
      const { stdout: checksum } = await execAsync(`sha256sum ${filename}`);

      // Upload to S3
      const fileContent = await promisify(require('fs').readFile)(filename);
      await s3.send(new PutObjectCommand({
        Bucket: BACKUP_BUCKET,
        Key: `backups/${filename}`,
        Body: fileContent,
        Metadata: {
          checksum: checksum.split(' ')[0],
          timestamp: timestamp.toISOString()
        }
      }));

      // Store backup metadata in Redis
      const backupInfo = {
        filename,
        size: fileContent.length,
        timestamp: timestamp.toISOString(),
        checksum: checksum.split(' ')[0]
      };

      await redis.hSet(
        'backup:metadata',
        filename,
        JSON.stringify(backupInfo)
      );

      // Cleanup local file
      await execAsync(`rm ${filename}`);

      return backupInfo;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    } finally {
      this.backupInProgress = false;
    }
  }

  async verifyBackup(filename: string): Promise<boolean> {
    try {
      // Download backup from S3
      const tempFile = join(process.cwd(), 'temp', filename);
      await s3.send(new PutObjectCommand({
        Bucket: BACKUP_BUCKET,
        Key: `backups/${filename}`,
        Body: tempFile
      }));

      // Verify backup integrity
      await execAsync(
        `pg_restore --list ${tempFile} > /dev/null`
      );

      // Cleanup
      await execAsync(`rm ${tempFile}`);
      return true;
    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - BACKUP_RETENTION_DAYS);

      // Get all backups from Redis
      const backups = await redis.hGetAll('backup:metadata');
      
      for (const [filename, infoStr] of Object.entries(backups)) {
        const info = JSON.parse(infoStr);
        const backupDate = new Date(info.timestamp);

        if (backupDate < cutoffDate) {
          // Delete from S3
          await s3.send(new PutObjectCommand({
            Bucket: BACKUP_BUCKET,
            Key: `backups/${filename}`
          }));

          // Remove metadata from Redis
          await redis.hDel('backup:metadata', filename);
        }
      }
    } catch (error) {
      console.error('Backup cleanup failed:', error);
      throw error;
    }
  }
}

// Schedule backups
export function scheduleBackups() {
  const backupService = BackupService.getInstance();

  // Daily full backup at 2 AM
  const dailyBackup = async () => {
    try {
      console.log('Starting daily backup...');
      await backupService.createBackup();
      console.log('Daily backup completed');
    } catch (error) {
      console.error('Daily backup failed:', error);
    }
  };

  // Weekly cleanup of old backups on Sunday at 3 AM
  const weeklyCleanup = async () => {
    try {
      console.log('Starting backup cleanup...');
      await backupService.cleanupOldBackups();
      console.log('Backup cleanup completed');
    } catch (error) {
      console.error('Backup cleanup failed:', error);
    }
  };

  // Schedule daily backup
  setInterval(dailyBackup, 24 * 60 * 60 * 1000);
  
  // Schedule weekly cleanup
  setInterval(weeklyCleanup, 7 * 24 * 60 * 60 * 1000);

  // Run initial backup
  dailyBackup();
}