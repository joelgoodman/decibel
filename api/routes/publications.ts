import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { createPublication, getPublicationBySlug, getPublicationsByAuthor } from '../models/publication';
import { z } from 'zod';

const router = Router();

const createPublicationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

router.post('/', authenticate, checkPermission('create:publications'), async (req, res, next) => {
  try {
    const { title, description } = createPublicationSchema.parse(req.body);
    const publication = await createPublication(title, req.user!.id, description);
    res.status(201).json(publication);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const publications = await getPublicationsByAuthor(req.user!.id);
    res.json(publications);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const publication = await getPublicationBySlug(req.params.slug);
    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    res.json(publication);
  } catch (error) {
    next(error);
  }
});

export const publicationRoutes = router;