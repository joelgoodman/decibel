/**
 * @swagger
 * /content:
 *   get:
 *     summary: List content items
 *     description: Retrieve a paginated list of content items
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by content type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: A paginated list of content items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Content'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 links:
 *                   $ref: '#/components/schemas/PaginationLinks'
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { validateContent } from '../middleware/validation/content';
import { cache } from '../middleware/cache';
import { 
  createContent, 
  getContentById,
  updateContent,
  searchContent,
  softDeleteContent
} from '../models/content';

const router = Router();

// List content
router.get('/',
  authenticate,
  checkPermission('read:content'),
  cache({ ttl: 300 }),
  async (req, res) => {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const result = await searchContent({
      type: type?.toString(),
      status: status?.toString(),
      page: Number(page),
      limit: Number(limit)
    });

    res.formatApi(result.content, {
      page: Number(page),
      limit: Number(limit),
      total: result.total
    });
  }
);

// Get content by ID
router.get('/:id',
  authenticate,
  checkPermission('read:content'),
  cache({ ttl: 300 }),
  async (req, res) => {
    const content = await getContentById(req.params.id);
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    res.formatApi(content);
  }
);

// Create content
router.post('/',
  authenticate,
  checkPermission('create:content'),
  validateContent,
  async (req, res) => {
    const content = await createContent({
      ...req.body,
      createdBy: req.user!.id
    });
    res.status(201).formatApi(content);
  }
);

// Update content
router.patch('/:id',
  authenticate,
  checkPermission('update:content'),
  validateContent,
  async (req, res) => {
    const content = await updateContent(
      req.params.id,
      req.body,
      req.user!.id
    );
    
    if (!content) {
      throw new NotFoundError('Content not found');
    }
    
    res.formatApi(content);
  }
);

// Delete content
router.delete('/:id',
  authenticate,
  checkPermission('delete:content'),
  async (req, res) => {
    const success = await softDeleteContent(req.params.id);
    
    if (!success) {
      throw new NotFoundError('Content not found');
    }
    
    res.status(204).end();
  }
);

export const contentRoutes = router;