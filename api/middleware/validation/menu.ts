import { z } from 'zod';
import { ValidationError } from '../../lib/validation/errors';

const menuItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1, 'Label is required').max(100),
  url: z.string().min(1, 'URL is required'),
  type: z.enum(['custom', 'page', 'category']),
  parentId: z.string().uuid().nullable().optional(),
  order: z.number().int().min(0),
  target: z.enum(['_blank', '_self']).optional(),
  icon: z.string().optional(),
  children: z.lazy(() => menuItemSchema.array()).optional()
});

const menuSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  location: z.string()
    .min(1, 'Location is required')
    .max(50, 'Location must be less than 50 characters'),
  
  items: z.array(menuItemSchema)
    .max(50, 'Menu cannot have more than 50 items')
});

export async function validateMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = await menuSchema.parseAsync(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Menu validation failed', error.errors));
    } else {
      next(error);
    }
  }
}