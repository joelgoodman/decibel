import { redis } from './redis';
import { Request } from 'express';
import { format } from 'date-fns';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE'
}

export enum AuditResource {
  USER = 'USER',
  CONTENT = 'CONTENT',
  PUBLICATION = 'PUBLICATION',
  TAXONOMY = 'TAXONOMY',
  SESSION = 'SESSION',
  SYSTEM = 'SYSTEM'
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private readonly RETENTION_DAYS = 90; // Keep logs for 90 days

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(
    req: Request,
    action: AuditAction,
    resource: AuditResource,
    details: Record<string, any> = {},
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS',
    error?: Error
  ): Promise<void> {
    const timestamp = new Date();
    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: timestamp.toISOString(),
      userId: req.user?.id || null,
      action,
      resource,
      resourceId: details.id,
      details: this.sanitizeDetails(details),
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      status,
      errorMessage: error?.message
    };

    // Store in Redis with expiration
    const key = `audit:${format(timestamp, 'yyyy-MM-dd')}:${logEntry.id}`;
    await redis.setEx(
      key,
      this.RETENTION_DAYS * 24 * 60 * 60, // Convert days to seconds
      JSON.stringify(logEntry)
    );

    // If it's a security-related event, also store in a separate set
    if (this.isSecurityEvent(action)) {
      await redis.sAdd('audit:security', logEntry.id);
    }

    // If it's a failure, store in a separate set for monitoring
    if (status === 'FAILURE') {
      await redis.sAdd('audit:failures', logEntry.id);
    }
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private isSecurityEvent(action: AuditAction): boolean {
    return [
      AuditAction.LOGIN,
      AuditAction.LOGOUT,
      AuditAction.TOKEN_REFRESH,
      AuditAction.PERMISSION_CHANGE
    ].includes(action);
  }

  async getRecentLogs(
    options: {
      userId?: string;
      action?: AuditAction;
      resource?: AuditResource;
      status?: 'SUCCESS' | 'FAILURE';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLog[]> {
    const { limit = 50, offset = 0 } = options;
    const logs: AuditLog[] = [];
    
    // Get all keys for the last 7 days
    const keys = await this.getRecentKeys(7);
    
    for (const key of keys) {
      const log = await redis.get(key);
      if (log) {
        const parsed = JSON.parse(log) as AuditLog;
        
        // Apply filters
        if (options.userId && parsed.userId !== options.userId) continue;
        if (options.action && parsed.action !== options.action) continue;
        if (options.resource && parsed.resource !== options.resource) continue;
        if (options.status && parsed.status !== options.status) continue;
        
        logs.push(parsed);
      }
    }

    // Sort by timestamp descending and apply pagination
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }

  private async getRecentKeys(days: number): Promise<string[]> {
    const keys: string[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = format(new Date(now.getTime() - i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const pattern = `audit:${date}:*`;
      const dayKeys = await redis.keys(pattern);
      keys.push(...dayKeys);
    }
    
    return keys;
  }

  async cleanup(): Promise<void> {
    // Cleanup is handled automatically by Redis key expiration
    console.log('Audit log cleanup is managed by Redis TTL');
  }
}

export const auditLogger = AuditLogger.getInstance();