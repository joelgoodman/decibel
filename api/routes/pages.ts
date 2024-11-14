/**
 * @swagger
 * /pages:
 *   get:
 *     summary: List all pages
 *     description: Retrieve a paginated list of pages
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { validatePage } from '../middleware/validation/page';
import { cache } from '../middleware/cache';
import { 
  createPage,
  getPageById,
  getPageBySlug,
  updatePage,
  searchPages,
  deletePage
} from '../models/page';
import { auditLogger, AuditAction, AuditResource } from '../lib/audit';

const router = Router();

router.get('/',
  cache({ ttl: 300 }),
  async (req, res) => {
    const result = await searchPages({
      query: req.query.search?.toString(),
      status: req.query.status?.toString() as any,
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined
    });

    res.formatApi(result.pages, {
      total: result.total,
      page: Math.floor(parseInt(req.query.offset?.toString() || '0') / parseInt(req.query.limit?.toString() || '10')) + 1,
      limit: parseInt(req.query.limit?.toString() || '10')
    });
  }
);

router.get('/:idOrSlug',
  cache({ ttl: 300 }),
  async (req, res) => {
    const page = req.params.idOrSlug.length === 36 
      ? await getPageById(req.params.idOrSlug)
      : await getPageBySlug(req.params.idOrSlug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.formatApi(page);
  }
);

router.post('/',
  authenticate,
  checkPermission('manage:pages'),
  validatePage,
  async (req, res) => {
    const page = await createPage({
      ...req.body,
      authorId: req.user!.id
    });

    auditLogger.log(req, AuditAction.CREATE, AuditResource.CONTENT, {
      id: page.id,
      title: page.title
    });

    res.status(201).formatApi(page);
  }
);

router.patch('/:id',
  authenticate,
  checkPermission('manage:pages'),
  validatePage,
  async (req, res) => {
    const page = await updatePage(req.params.id, req.body);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    auditLogger.log(req, AuditAction.UPDATE, AuditResource.CONTENT, {
      id: page.id,
      title: page.title
    });

    res.formatApi(page);
  }
);

router.delete('/:id',
  authenticate,
  checkPermission('manage:pages'),
  async (req, res) => {
    const success = await deletePage(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }

    auditLogger.log(req, AuditAction.DELETE, AuditResource.CONTENT, {
      id: req.params.id
    });

    res.status(204).end();
  }
);

export const pageRoutes = router;