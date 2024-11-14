import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { validatePost } from '../middleware/validation/post';
import { cache } from '../middleware/cache';
import { 
  createPost,
  getPostById,
  searchPosts,
  toggleLike,
  addComment
} from '../models/post';
import { auditLogger, AuditAction } from '../lib/audit';

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: List posts
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *       - name: orderBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [date, likes, comments]
 */
router.get('/',
  cache({ ttl: 300 }),
  async (req, res) => {
    const result = await searchPosts({
      query: req.query.query?.toString(),
      status: req.query.status?.toString() as any,
      orderBy: req.query.orderBy as any,
      limit: req.query.limit ? parseInt(req.query.limit.toString()) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset.toString()) : undefined
    });

    res.formatApi(result.posts, {
      total: result.total,
      page: Math.floor(parseInt(req.query.offset?.toString() || '0') / parseInt(req.query.limit?.toString() || '10')) + 1,
      limit: parseInt(req.query.limit?.toString() || '10')
    });
  }
);

router.get('/:id',
  cache({ ttl: 300 }),
  async (req, res) => {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.formatApi(post);
  }
);

router.post('/',
  authenticate,
  checkPermission('create:posts'),
  validatePost,
  async (req, res) => {
    const post = await createPost({
      ...req.body,
      authorId: req.user!.id
    });

    auditLogger.log(req, AuditAction.CREATE, 'POST', {
      id: post.id,
      title: post.title
    });

    res.status(201).formatApi(post);
  }
);

router.post('/:id/like',
  authenticate,
  async (req, res) => {
    const isLiked = await toggleLike(req.params.id, req.user!.id);
    res.json({ liked: isLiked });
  }
);

router.post('/:id/comments',
  authenticate,
  async (req, res) => {
    if (!req.body.content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await addComment(
      req.params.id,
      req.user!.id,
      req.body.content
    );

    res.status(201).json(comment);
  }
);

export const postRoutes = router;