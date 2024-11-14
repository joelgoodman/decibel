import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rateLimiters } from '../middleware/security';
import { contentRoutes } from './content';
import { taxonomyRoutes } from './taxonomies';
import { userRoutes } from './users';
import { authRoutes } from './auth';
import { mediaRoutes } from './media';
import { healthRoutes } from './health';

const router = Router();

// Public routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Protected routes
router.use(authenticate);
router.use(rateLimiters.api);

router.use('/content', contentRoutes);
router.use('/taxonomies', taxonomyRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);

export const apiRoutes = router;