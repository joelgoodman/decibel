import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { newsletterService } from '../services/newsletter';
import { query } from '../lib/db';
import { z } from 'zod';

const router = Router();

const sendNewsletterSchema = z.object({
  contentId: z.string().uuid(),
  test: z.boolean().optional(),
  testEmail: z.string().email().optional()
});

router.post('/send',
  authenticate,
  checkPermission('send:newsletter'),
  async (req, res, next) => {
    try {
      const { contentId, test, testEmail } = sendNewsletterSchema.parse(req.body);

      if (test) {
        if (!testEmail) {
          return res.status(400).json({ error: 'Test email is required' });
        }

        await newsletterService.sendTestNewsletter(contentId, testEmail);
        return res.json({ message: 'Test newsletter sent' });
      }

      // Get content and active subscribers
      const [content, subscribers] = await Promise.all([
        query(
          `SELECT * FROM content WHERE id = $1`,
          [contentId]
        ),
        query(
          `SELECT u.id, u.email, u.name, u.preferences
           FROM users u
           JOIN subscriptions s ON u.id = s.user_id
           WHERE s.status = 'ACTIVE'
           AND u.deleted_at IS NULL`
        )
      ]);

      if (!content.rows[0]) {
        return res.status(404).json({ error: 'Content not found' });
      }

      await newsletterService.sendNewsletter({
        content: content.rows[0],
        subscribers: subscribers.rows
      });

      res.json({ message: 'Newsletter sending started' });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/stats/:contentId',
  authenticate,
  checkPermission('read:newsletter'),
  async (req, res) => {
    const stats = await query(
      `SELECT * FROM newsletter_stats
       WHERE content_id = $1
       ORDER BY created_at DESC`,
      [req.params.contentId]
    );

    res.json(stats.rows);
  }
);

export const newsletterRoutes = router;