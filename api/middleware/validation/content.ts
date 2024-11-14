import { Request, Response, NextFunction } from 'express';
import { contentSchema } from '../../lib/validation/content-blocks';
import { sanitizeContent } from '../../lib/validation/sanitize';
import { ValidationError } from '../../lib/validation/errors';

export const validateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // First sanitize the content
    const sanitizedContent = sanitizeContent(req.body);
    
    // Then validate the sanitized content
    const validated = await contentSchema.parseAsync(sanitizedContent);
    
    // Update request body with sanitized and validated content
    req.body = validated;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const validationError = new ValidationError('Content validation failed', 
        error.errors.map(err => ({
          path: err.path,
          message: err.message,
          code: err.code
        }))
      );
      next(validationError);
    } else {
      next(error);
    }
  }
};