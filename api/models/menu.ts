import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import { cacheService } from '../lib/cache';
import type { Menu, MenuItem } from '../types/menus';

export async function getMenus(): Promise<Menu[]> {
  const cacheKey = 'menus:all';
  const cached = await cacheService.get<Menu[]>(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT id, name, location, items, created_at, updated_at
     FROM menus
     WHERE deleted_at IS NULL
     ORDER BY name ASC`
  );

  const menus = result.rows;
  await cacheService.set(cacheKey, menus);
  return menus;
}

export async function getMenuById(id: string): Promise<Menu | null> {
  const cacheKey = `menus:${id}`;
  const cached = await cacheService.get<Menu>(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT id, name, location, items, created_at, updated_at
     FROM menus
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  const menu = result.rows[0] || null;
  if (menu) {
    await cacheService.set(cacheKey, menu);
  }
  return menu;
}

export async function createMenu(data: {
  name: string;
  location: string;
  items: MenuItem[];
}): Promise<Menu> {
  const result = await query(
    `INSERT INTO menus (id, name, location, items)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, location, items, created_at, updated_at`,
    [
      randomUUID(),
      data.name,
      data.location,
      JSON.stringify(data.items)
    ]
  );

  await cacheService.invalidate('menus:*');
  return result.rows[0];
}

export async function updateMenu(
  id: string,
  data: Partial<{
    name: string;
    location: string;
    items: MenuItem[];
  }>
): Promise<Menu | null> {
  const setFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    setFields.push(`name = $${paramCount}`);
    values.push(data.name);
    paramCount++;
  }

  if (data.location !== undefined) {
    setFields.push(`location = $${paramCount}`);
    values.push(data.location);
    paramCount++;
  }

  if (data.items !== undefined) {
    setFields.push(`items = $${paramCount}`);
    values.push(JSON.stringify(data.items));
    paramCount++;
  }

  if (setFields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE menus
     SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount} AND deleted_at IS NULL
     RETURNING id, name, location, items, created_at, updated_at`,
    values
  );

  const menu = result.rows[0] || null;
  if (menu) {
    await cacheService.invalidate(`menus:${id}`);
    await cacheService.invalidate('menus:all');
  }
  return menu;
}

export async function deleteMenu(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE menus
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  if (result.rowCount > 0) {
    await cacheService.invalidate(`menus:${id}`);
    await cacheService.invalidate('menus:all');
    return true;
  }
  return false;
}