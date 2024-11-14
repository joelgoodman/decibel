/**
 * @swagger
 * /menus:
 *   get:
 *     summary: List all menus
 *     description: Retrieve all navigation menus
 *     responses:
 *       200:
 *         description: List of menus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Menu'
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac';
import { validateMenu } from '../middleware/validation/menu';
import { cache } from '../middleware/cache';
import { 
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
} from '../models/menu';
import { auditLogger, AuditAction, AuditResource } from '../lib/audit';

const router = Router();

router.get('/',
  cache({ ttl: 300 }),
  async (req, res) => {
    const menus = await getMenus();
    res.formatApi(menus);
  }
);

router.get('/:id',
  cache({ ttl: 300 }),
  async (req, res) => {
    const menu = await getMenuById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    res.formatApi(menu);
  }
);

router.post('/',
  authenticate,
  checkPermission('manage:menus'),
  validateMenu,
  async (req, res) => {
    const menu = await createMenu(req.body);

    auditLogger.log(req, AuditAction.CREATE, AuditResource.SYSTEM, {
      id: menu.id,
      name: menu.name
    });

    res.status(201).formatApi(menu);
  }
);

router.patch('/:id',
  authenticate,
  checkPermission('manage:menus'),
  validateMenu,
  async (req, res) => {
    const menu = await updateMenu(req.params.id, req.body);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    auditLogger.log(req, AuditAction.UPDATE, AuditResource.SYSTEM, {
      id: menu.id,
      name: menu.name
    });

    res.formatApi(menu);
  }
);

router.delete('/:id',
  authenticate,
  checkPermission('manage:menus'),
  async (req, res) => {
    const success = await deleteMenu(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    auditLogger.log(req, AuditAction.DELETE, AuditResource.SYSTEM, {
      id: req.params.id
    });

    res.status(204).end();
  }
);

export const menuRoutes = router;