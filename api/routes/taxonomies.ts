import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { 
  createTaxonomy,
  getTaxonomyById,
  getTaxonomiesByContent,
  updateContentTaxonomies,
  searchTaxonomies,
  updateTaxonomy,
  deleteTaxonomy
} from '../models/taxonomy';
import {
  createTaxonomySettings,
  getTaxonomySettings,
  updateTaxonomySettings
} from '../models/taxonomy-settings';

const router = Router();

const createTaxonomySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  publicationId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional()
});

const updateTaxonomySchema = createTaxonomySchema.partial().omit({
  publicationId: true,
  type: true
});

const updateTaxonomySettingsSchema = z.object({
  isRequired: z.boolean().optional(),
  maxItems: z.number().min(1).optional().nullable()
});

const contentTaxonomiesSchema = z.object({
  taxonomyIds: z.array(z.string().uuid())
});

// Create taxonomy
router.post('/',
  authenticate,
  checkPermission('create:taxonomies'),
  async (req, res, next) => {
    try {
      const data = createTaxonomySchema.parse(req.body);
      const taxonomy = await createTaxonomy(data);
      res.status(201).json(taxonomy);
    } catch (error) {
      next(error);
    }
  }
);

// Get taxonomy by ID
router.get('/:id',
  authenticate,
  checkPermission('read:taxonomies'),
  async (req, res, next) => {
    try {
      const taxonomy = await getTaxonomyById(req.params.id);
      if (!taxonomy) {
        return res.status(404).json({ error: 'Taxonomy not found' });
      }
      res.json(taxonomy);
    } catch (error) {
      next(error);
    }
  }
);

// Update taxonomy
router.patch('/:id',
  authenticate,
  checkPermission('update:taxonomies'),
  async (req, res, next) => {
    try {
      const data = updateTaxonomySchema.parse(req.body);
      const taxonomy = await updateTaxonomy(req.params.id, data);
      if (!taxonomy) {
        return res.status(404).json({ error: 'Taxonomy not found' });
      }
      res.json(taxonomy);
    } catch (error) {
      next(error);
    }
  }
);

// Delete taxonomy
router.delete('/:id',
  authenticate,
  checkPermission('delete:taxonomies'),
  async (req, res, next) => {
    try {
      const success = await deleteTaxonomy(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Taxonomy not found' });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// Search taxonomies
router.get('/',
  authenticate,
  checkPermission('read:taxonomies'),
  async (req, res, next) => {
    try {
      const { query, type, publicationId, parentId, limit, offset } = req.query;
      const result = await searchTaxonomies({
        query: query?.toString(),
        type: type?.toString(),
        publicationId: publicationId?.toString(),
        parentId: parentId?.toString(),
        limit: limit ? parseInt(limit.toString()) : undefined,
        offset: offset ? parseInt(offset.toString()) : undefined
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Get taxonomies by content
router.get('/content/:contentId',
  authenticate,
  checkPermission('read:taxonomies'),
  async (req, res, next) => {
    try {
      const taxonomies = await getTaxonomiesByContent(req.params.contentId);
      res.json(taxonomies);
    } catch (error) {
      next(error);
    }
  }
);

// Update content taxonomies
router.put('/content/:contentId',
  authenticate,
  checkPermission('update:content'),
  async (req, res, next) => {
    try {
      const { taxonomyIds } = contentTaxonomiesSchema.parse(req.body);
      await updateContentTaxonomies(req.params.contentId, taxonomyIds);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// Create taxonomy settings
router.post('/settings/:publicationId/:type',
  authenticate,
  checkPermission('manage:taxonomies'),
  async (req, res, next) => {
    try {
      const { publicationId, type } = req.params;
      const data = updateTaxonomySettingsSchema.parse(req.body);
      
      const settings = await createTaxonomySettings({
        publicationId,
        type,
        ...data
      });
      
      res.status(201).json(settings);
    } catch (error) {
      next(error);
    }
  }
);

// Update taxonomy settings
router.patch('/settings/:publicationId/:type',
  authenticate,
  checkPermission('manage:taxonomies'),
  async (req, res, next) => {
    try {
      const { publicationId, type } = req.params;
      const data = updateTaxonomySettingsSchema.parse(req.body);
      
      const settings = await getTaxonomySettings(publicationId, type);
      if (!settings) {
        return res.status(404).json({ error: 'Taxonomy settings not found' });
      }
      
      const updated = await updateTaxonomySettings(settings.id, data);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// Get taxonomy settings
router.get('/settings/:publicationId/:type',
  authenticate,
  checkPermission('read:taxonomies'),
  async (req, res, next) => {
    try {
      const { publicationId, type } = req.params;
      const settings = await getTaxonomySettings(publicationId, type);
      
      if (!settings) {
        return res.status(404).json({ error: 'Taxonomy settings not found' });
      }
      
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
);

export const taxonomyRoutes = router;