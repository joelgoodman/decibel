import mjml2html from 'mjml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTransport } from 'nodemailer';
import { logger } from '../lib/logger';
import { redis } from '../lib/redis';
import { auditLogger, AuditAction } from '../lib/audit';

// Initialize email transport
const transport = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

// MJML API configuration
const mjmlConfig = {
  apiKey: process.env.MJML_API_ID,
  apiSecret: process.env.MJML_API_SECRET
};

interface EmailTemplate {
  subject: string;
  content: string;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  private templateCache: Map<string, EmailTemplate> = new Map();

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const template = await this.getTemplate(options.template);
      const renderedContent = this.renderTemplate(template.content, options.data);
      const { html } = mjml2html(renderedContent, mjmlConfig);

      await transport.sendMail({
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: this.renderTemplate(template.subject, options.data),
        html,
        attachments: options.attachments
      });

      // Log success
      logger.info({
        message: 'Email sent successfully',
        template: options.template,
        to: options.to
      });

      // Track email metrics
      await this.trackEmailMetrics(options.template, true);
    } catch (error) {
      logger.error('Failed to send email:', error);
      await this.trackEmailMetrics(options.template, false);
      throw error;
    }
  }

  async sendBulkEmail(options: SendEmailOptions & { 
    batchSize?: number 
  }): Promise<{ success: number; failed: number }> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const batchSize = options.batchSize || 50;
    const results = { success: 0, failed: 0 };

    // Split recipients into batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        await this.sendEmail({
          ...options,
          to: batch
        });
        results.success += batch.length;

        // Add delay between batches to prevent rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.failed += batch.length;
        logger.error('Batch email failed:', error);
      }
    }

    return results;
  }

  private async getTemplate(name: string): Promise<EmailTemplate> {
    // Check cache first
    if (this.templateCache.has(name)) {
      return this.templateCache.get(name)!;
    }

    // Load template from file system
    const templatePath = join(__dirname, '../templates', `${name}.mjml`);
    const template = {
      subject: await this.loadTemplateSubject(name),
      content: readFileSync(templatePath, 'utf-8')
    };

    // Cache template
    this.templateCache.set(name, template);
    return template;
  }

  private async loadTemplateSubject(name: string): Promise<string> {
    const subjectPath = join(__dirname, '../templates', `${name}.subject.txt`);
    return readFileSync(subjectPath, 'utf-8').trim();
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = key.trim().split('.').reduce((obj: any, k: string) => obj?.[k], data);
      return value ?? match;
    });
  }

  private async trackEmailMetrics(template: string, success: boolean): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const prefix = `email:metrics:${date}:${template}`;

    await Promise.all([
      redis.incr(`${prefix}:${success ? 'success' : 'failed'}`),
      redis.incr(`${prefix}:total`)
    ]);
  }

  async getEmailMetrics(days: number = 7): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const keys = await redis.keys(`email:metrics:${date}:*`);
      const values = await redis.mGet(keys);

      keys.forEach((key, index) => {
        const [_, __, date, template, metric] = key.split(':');
        
        if (!metrics[template]) {
          metrics[template] = {
            success: 0,
            failed: 0,
            total: 0
          };
        }

        metrics[template][metric] += parseInt(values[index] || '0');
      });
    }

    return metrics;
  }
}

export const emailService = EmailService.getInstance();