import { z } from 'zod';
import { ValidationError } from '../../lib/validation/errors';

const profileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  avatar: z.string().url().optional().nullable(),
  
  preferences: z.object({
    emailNotifications: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    timezone: z.string().optional()
  }).optional()
});

export async function validateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = await profileSchema.parseAsync(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Profile validation failed', error.errors));
    } else {
      next(error);
    }
  }
}