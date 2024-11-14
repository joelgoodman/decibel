import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';

const TIMESTAMP_TOLERANCE = 5 * 60 * 1000; // 5 minutes

export class RequestSigner {
  constructor(private readonly secret: string) {}

  sign(method: string, path: string, timestamp: number, body?: string): string {
    const message = this.createMessage(method, path, timestamp, body);
    return this.createSignature(message);
  }

  verify(request: Request, signature: string): boolean {
    const timestamp = parseInt(request.get('X-Request-Timestamp') || '0', 10);
    
    // Check timestamp freshness
    if (!this.isTimestampValid(timestamp)) {
      return false;
    }

    const expectedSignature = this.sign(
      request.method,
      request.path,
      timestamp,
      request.body ? JSON.stringify(request.body) : undefined
    );

    try {
      return timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  private createMessage(
    method: string,
    path: string,
    timestamp: number,
    body?: string
  ): string {
    const parts = [
      method.toUpperCase(),
      path,
      timestamp.toString()
    ];

    if (body) {
      parts.push(body);
    }

    return parts.join('\n');
  }

  private createSignature(message: string): string {
    return createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  private isTimestampValid(timestamp: number): boolean {
    const now = Date.now();
    return Math.abs(now - timestamp) <= TIMESTAMP_TOLERANCE;
  }
}

export const requestSigner = new RequestSigner(process.env.API_SIGNING_SECRET!);