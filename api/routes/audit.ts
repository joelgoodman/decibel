import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { auditLogger, AuditAction, AuditResource } from '../lib/audit';
import { z } from 'zod';

const router = Router();

const querySchema = z.object({
  userId: z.string().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  resource: z.nativeEnum(AuditResource).optional(),
  status: z.enum(['SUCCESS', 'FAILURE']).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional()
});

router.get('/',
  authenticate,
  checkPermission('read:audit'),
  async (req, res, next) => {
    try {
      const query = querySchema.parse(req.query);
      const logs = await auditLogger.getRecentLogs(query);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
);

export const auditRoutes = router;