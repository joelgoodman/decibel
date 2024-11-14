import { query } from '../lib/db';
import { updateContent } from '../models/content';
import type { Content } from '../types/database';

class ContentScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  start() {
    // Check every minute
    this.timer = setInterval(() => this.processScheduledContent(), 60 * 1000);
    console.log('Content scheduler started');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('Content scheduler stopped');
  }

  private async processScheduledContent() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      const result = await query(
        `SELECT id, publication_id
         FROM content
         WHERE status = 'SCHEDULED'
         AND scheduled_at <= $1
         AND deleted_at IS NULL`,
        [now]
      );

      for (const content of result.rows) {
        try {
          await updateContent(
            content.id,
            { status: 'PUBLISHED' },
            'system'
          );
          console.log(`Published scheduled content: ${content.id}`);
        } catch (error) {
          console.error(`Failed to publish content ${content.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing scheduled content:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const contentScheduler = new ContentScheduler();