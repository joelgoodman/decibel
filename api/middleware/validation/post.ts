import { z } from 'zod';
import { sanitizeContent } from '../../lib/validation/sanitize';
import { ValidationError } from '../../lib/validation/errors';

const postSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  content: z.array(z.any())
    .min(1, 'Content is required'),
  
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  
  meta: z.object({
    title: z.string()
      .max(60, 'Meta title must be less than 60 characters'),
    description: z.string()
      .max(160, 'Meta description must be less than 160 characters'),
    ogImage: z.string().url().optional(),
    canonical: z.string().url().optional(),
    noindex: z.boolean().optional(),
    structuredData: z.record(z.any()).optional()
  }),

  taxonomies: z.array(z.string().uuid()).optional(),
  
  scheduledAt: z.string().datetime().optional()
}).refine(
  data => {
    if (data.status === 'scheduled' && !data.scheduledAt) {
      return false;
    }
    if (data.scheduledAt && new Date(data.scheduledAt) <= new Date()) {
      return false;
    }
    return true;
  },
  {
    message: 'Invalid scheduling configuration',
    path: ['scheduledAt']
  }
);

export async function validatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const sanitizedData = {
      ...req.body,
      content: sanitizeContent(req.body.content)
    };

    const validated = await postSchema.parseAsync(sanitizedData);
    req.body = validated;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Post validation failed', error.errors));
    } else {
      next(error);
    }
  }
}