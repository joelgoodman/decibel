import { Request, Response, NextFunction } from 'express';
import { auditLogger, AuditAction, AuditResource } from '../lib/audit';

export function createAuditMiddleware(
  action: AuditAction,
  resource: AuditResource
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalStatus = res.status;
    let statusCode = 200;

    // Override status to capture the actual response status
    res.status = function(code: number) {
      statusCode = code;
      return originalStatus.apply(res, [code]);
    };

    // Override json to capture the response
    res.json = function(body: any) {
      const isSuccess = statusCode >= 200 && statusCode < 400;
      
      auditLogger.log(
        req,
        action,
        resource,
        {
          id: body?.id,
          statusCode,
          requestPath: req.path,
          requestMethod: req.method,
          ...req.params
        },
        isSuccess ? 'SUCCESS' : 'FAILURE'
      ).catch(console.error);

      return originalJson.apply(res, [body]);
    };

    next();
  };
}