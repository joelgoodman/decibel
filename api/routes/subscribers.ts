import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import multer from 'multer';
import { parse } from 'csv-parse';
import { createObjectCsvWriter } from 'csv-writer';
import { createUser, getUserByEmail } from '../models/user';
import { query, transaction } from '../lib/db';
import { ValidationError } from '../lib/validation/errors';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Import subscribers from CSV
router.post('/import',
  authenticate,
  checkPermission('manage:subscribers'),
  upload.single('file'),
  async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const results = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };

    try {
      const records = await new Promise((resolve, reject) => {
        parse(req.file!.buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
          trim: true
        }, (err, records) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      results.total = records.length;

      await transaction(async (query) => {
        for (const record of records) {
          try {
            const { email, name, roles = 'subscriber', subscription_type = 'free' } = record;
            
            if (!email) {
              throw new Error('Email is required');
            }

            const existingUser = await getUserByEmail(email);
            const roleNames = roles.split(',').map(r => r.trim());

            if (existingUser) {
              await query(
                `UPDATE users 
                 SET name = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [name || existingUser.name, existingUser.id]
              );

              await query(
                `UPDATE subscriptions
                 SET type = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2`,
                [subscription_type, existingUser.id]
              );

              results.updated++;
            } else {
              const user = await createUser({
                email,
                name: name || null,
                roleNames,
                metadata: { imported: true }
              });

              await query(
                `INSERT INTO subscriptions (id, user_id, type)
                 VALUES ($1, $2, $3)`,
                [crypto.randomUUID(), user.id, subscription_type]
              );

              results.created++;
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              email: record.email,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      });

      res.json(results);
    } catch (error) {
      next(error);
    }
  }
);

// Export subscribers to CSV
router.get('/export',
  authenticate,
  checkPermission('manage:subscribers'),
  async (req, res, next) => {
    try {
      const result = await query(
        `SELECT 
          u.email,
          u.name,
          string_agg(r.name, ',') as roles,
          s.type as subscription_type,
          u.created_at,
          u.updated_at
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         LEFT JOIN subscriptions s ON u.id = s.user_id
         WHERE u.deleted_at IS NULL
         GROUP BY u.id, s.type
         ORDER BY u.created_at DESC`
      );

      const csvWriter = createObjectCsvWriter({
        path: '/tmp/subscribers.csv',
        header: [
          { id: 'email', title: 'email' },
          { id: 'name', title: 'name' },
          { id: 'roles', title: 'roles' },
          { id: 'subscription_type', title: 'subscription_type' },
          { id: 'created_at', title: 'joined_date' },
          { id: 'updated_at', title: 'last_updated' }
        ]
      });

      await csvWriter.writeRecords(result.rows);

      res.download('/tmp/subscribers.csv', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      next(error);
    }
  }
);

export const subscriberRoutes = router;