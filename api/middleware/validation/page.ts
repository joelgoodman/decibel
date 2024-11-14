import { z } from 'zod';
import { sanitizeContent } from '../../lib/validation/sanitize';
import { ValidationError } from '../../lib/validation/errors';

const pageSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  
  content: z.array(z.any())
    .min(1, 'Content is required'),
  
  status: z.enum(['draft', 'published', 'archived']),
  
  template: z.enum(['default', 'full-width', 'landing'])
    .default('default'),
  
  meta: z.object({
    title: z.string()
      .max(60, 'Meta title must be less than 60 characters'),
    description: z.string()
      .max(160, 'Meta description must be less than 160 characters'),
    ogImage: z.string().url().optional(),
    canonical: z.string().url().optional(),
    noindex: z.boolean().optional()
  })
});

export async function validatePage(req: Request, res: Response, next: NextFunction) {
  try {
    const sanitizedData = {
      ...req.body,
      content: sanitizeContent(req.body.content)
    };

    const validated = await pageSchema.parseAsync(sanitizedData);
    req.body = validated;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Page validation failed', error.errors));
    } else {
      next(error);
    }
  }
}