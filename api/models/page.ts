import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import { cacheService } from '../lib/cache';
import { sanitizeContent } from '../lib/validation/sanitize';
import type { Page, PageStatus } from '../types/pages';

interface CreatePageOptions {
  title: string;
  slug: string;
  content: any[];
  authorId: string;
  status: PageStatus;
  template?: string;
  meta: {
    title: string;
    description: string;
    ogImage?: string;
    canonical?: string;
    noindex?: boolean;
  };
}

export async function createPage({
  title,
  slug,
  content,
  authorId,
  status,
  template = 'default',
  meta
}: CreatePageOptions): Promise<Page> {
  // Sanitize content
  const sanitizedContent = sanitizeContent(content);

  const result = await query(
    `INSERT INTO pages (
      id, title, slug, content, author_id, 
      status, template, meta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      randomUUID(),
      title,
      slug,
      JSON.stringify(sanitizedContent),
      authorId,
      status,
      template,
      JSON.stringify(meta)
    ]
  );

  await cacheService.invalidate('pages:*');
  return result.rows[0];
}

export async function getPageById(id: string): Promise<Page | null> {
  const cacheKey = `pages:${id}`;
  const cached = await cacheService.get<Page>(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT p.*, u.name as author_name
     FROM pages p
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [id]
  );

  const page = result.rows[0] || null;
  if (page) {
    await cacheService.set(cacheKey, page);
  }
  return page;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const cacheKey = `pages:slug:${slug}`;
  const cached = await cacheService.get<Page>(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT p.*, u.name as author_name
     FROM pages p
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.slug = $1 AND p.deleted_at IS NULL`,
    [slug]
  );

  const page = result.rows[0] || null;
  if (page) {
    await cacheService.set(cacheKey, page);
  }
  return page;
}

export async function updatePage(
  id: string,
  updates: Partial<CreatePageOptions>
): Promise<Page | null> {
  const setFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    setFields.push(`title = $${paramCount}`);
    values.push(updates.title);
    paramCount++;
  }

  if (updates.slug !== undefined) {
    setFields.push(`slug = $${paramCount}`);
    values.push(updates.slug);
    paramCount++;
  }

  if (updates.content !== undefined) {
    setFields.push(`content = $${paramCount}`);
    values.push(JSON.stringify(sanitizeContent(updates.content)));
    paramCount++;
  }

  if (updates.status !== undefined) {
    setFields.push(`status = $${paramCount}`);
    values.push(updates.status);
    paramCount++;
  }

  if (updates.template !== undefined) {
    setFields.push(`template = $${paramCount}`);
    values.push(updates.template);
    paramCount++;
  }

  if (updates.meta !== undefined) {
    setFields.push(`meta = $${paramCount}`);
    values.push(JSON.stringify(updates.meta));
    paramCount++;
  }

  if (setFields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE pages
     SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount} AND deleted_at IS NULL
     RETURNING *`,
    values
  );

  const page = result.rows[0] || null;
  if (page) {
    await cacheService.invalidate(`pages:${id}`);
    await cacheService.invalidate(`pages:slug:${page.slug}`);
    await cacheService.invalidate('pages:list');
  }
  return page;
}

export async function deletePage(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE pages
     SET deleted_at = CURRENT_TIMESTAMP, status = 'archived'
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING slug`,
    [id]
  );

  if (result.rows[0]) {
    await cacheService.invalidate(`pages:${id}`);
    await cacheService.invalidate(`pages:slug:${result.rows[0].slug}`);
    await cacheService.invalidate('pages:list');
    return true;
  }
  return false;
}

export async function searchPages(options: {
  query?: string;
  status?: PageStatus;
  limit?: number;
  offset?: number;
}): Promise<{ pages: Page[]; total: number }> {
  const {
    query = '',
    status,
    limit = 10,
    offset = 0
  } = options;

  const values: any[] = [`%${query}%`];
  let paramCount = 1;

  let sql = `
    SELECT p.*, u.name as author_name
    FROM pages p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.deleted_at IS NULL
    AND (p.title ILIKE $1 OR p.meta->>'title' ILIKE $1)
  `;

  if (status) {
    sql += ` AND p.status = $${++paramCount}`;
    values.push(status);
  }

  sql += ` ORDER BY p.updated_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  values.push(limit, offset);

  const result = await query(sql, values);

  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM pages p
     WHERE deleted_at IS NULL
     AND (title ILIKE $1 OR meta->>'title' ILIKE $1)
     ${status ? 'AND status = $2' : ''}`,
    status ? [`%${query}%`, status] : [`%${query}%`]
  );

  return {
    pages: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}