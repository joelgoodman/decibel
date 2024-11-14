import { Request, Response, NextFunction } from 'express';
import { requestSigner } from '../lib/security/hmac';
import { auditLogger, AuditAction, AuditResource } from '../lib/audit';

export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.get('X-Request-Signature');
  
  if (!signature) {
    auditLogger.log(
      req,
      AuditAction.CREATE,
      AuditResource.SYSTEM,
      { error: 'Missing signature' },
      'FAILURE'
    );
    return res.status(401).json({ error: 'Missing signature' });
  }

  if (!requestSigner.verify(req, signature)) {
    auditLogger.log(
      req,
      AuditAction.CREATE,
      AuditResource.SYSTEM,
      { error: 'Invalid signature' },
      'FAILURE'
    );
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}