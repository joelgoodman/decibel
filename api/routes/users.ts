/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { validateProfile } from '../middleware/validation/profile';
import { 
  updateUserProfile,
  getUserProfile,
  updateUserPreferences,
  updateUserAvatar
} from '../models/user';
import { auditLogger, AuditAction } from '../lib/audit';

const router = Router();

router.get('/me',
  authenticate,
  async (req, res) => {
    const profile = await getUserProfile(req.user!.id);
    res.json(profile);
  }
);

router.patch('/profile',
  authenticate,
  validateProfile,
  async (req, res) => {
    const profile = await updateUserProfile(req.user!.id, req.body);

    auditLogger.log(req, AuditAction.UPDATE, 'USER', {
      id: req.user!.id,
      changes: Object.keys(req.body)
    });

    res.json(profile);
  }
);

router.patch('/preferences',
  authenticate,
  async (req, res) => {
    const preferences = await updateUserPreferences(
      req.user!.id,
      req.body
    );

    auditLogger.log(req, AuditAction.UPDATE, 'USER', {
      id: req.user!.id,
      type: 'preferences'
    });

    res.json(preferences);
  }
);

router.post('/avatar',
  authenticate,
  upload.single('avatar'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const avatar = await updateUserAvatar(
      req.user!.id,
      req.file
    );

    auditLogger.log(req, AuditAction.UPDATE, 'USER', {
      id: req.user!.id,
      type: 'avatar'
    });

    res.json({ avatar });
  }
);

export const userRoutes = router;