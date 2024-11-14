import { emailService } from './email';
import { query, transaction } from '../lib/db';
import { logger } from '../lib/logger';
import { auditLogger, AuditAction } from '../lib/audit';
import type { Content } from '../types/database';

interface SendNewsletterOptions {
  content: Content;
  subscribers: Array<{
    id: string;
    email: string;
    name?: string;
    preferences?: Record<string, any>;
  }>;
  test?: boolean;
}

export class NewsletterService {
  private static instance: NewsletterService;

  private constructor() {}

  static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService();
    }
    return NewsletterService.instance;
  }

  async sendNewsletter(options: SendNewsletterOptions): Promise<void> {
    const { content, subscribers, test = false } = options;

    try {
      // Update newsletter status
      await query(
        `UPDATE content
         SET newsletter_status = 'SENDING',
            newsletter_error = NULL
         WHERE id = $1`,
        [content.id]
      );

      // Send to subscribers in batches
      const results = await emailService.sendBulkEmail({
        template: 'newsletter',
        subject: content.title,
        to: subscribers.map(s => s.email),
        data: {
          content,
          site_name: process.env.SITE_NAME,
          logo_url: process.env.LOGO_URL,
          unsubscribe_url: `${process.env.FRONTEND_URL}/unsubscribe`
        },
        batchSize: 50
      });

      // Update status based on results
      await query(
        `UPDATE content
         SET newsletter_status = $1,
             newsletter_sent_at = CURRENT_TIMESTAMP,
             newsletter_error = $2
         WHERE id = $3`,
        [
          results.failed === 0 ? 'SENT' : 'FAILED',
          results.failed > 0 ? `Failed to send to ${results.failed} subscribers` : null,
          content.id
        ]
      );

      // Log metrics
      if (!test) {
        await this.logNewsletterMetrics(content.id, results);
      }
    } catch (error) {
      logger.error('Newsletter sending failed:', error);

      await query(
        `UPDATE content
         SET newsletter_status = 'FAILED',
             newsletter_error = $1
         WHERE id = $2`,
        [
          error instanceof Error ? error.message : 'Unknown error',
          content.id
        ]
      );

      throw error;
    }
  }

  async sendTestNewsletter(contentId: string, email: string): Promise<void> {
    const content = await query(
      `SELECT * FROM content WHERE id = $1`,
      [contentId]
    );

    if (!content.rows[0]) {
      throw new Error('Content not found');
    }

    await emailService.sendEmail({
      template: 'newsletter',
      subject: `[TEST] ${content.rows[0].title}`,
      to: email,
      data: {
        content: content.rows[0],
        site_name: process.env.SITE_NAME,
        logo_url: process.env.LOGO_URL,
        test: true
      }
    });
  }

  private async logNewsletterMetrics(
    contentId: string,
    results: { success: number; failed: number }
  ): Promise<void> {
    await transaction(async (query) => {
      // Update newsletter stats
      await query(
        `INSERT INTO newsletter_stats (
          id, content_id, sent_count, failed_count, created_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [
          crypto.randomUUID(),
          contentId,
          results.success,
          results.failed
        ]
      );

      // Log audit event
      auditLogger.log({
        action: AuditAction.CREATE,
        resource: 'NEWSLETTER',
        details: {
          contentId,
          sentCount: results.success,
          failedCount: results.failed
        }
      });
    });
  }
}

export const newsletterService = NewsletterService.getInstance();