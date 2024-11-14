import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import type { Publication } from '../types/database';

interface CreatePublicationOptions {
  title: string;
  authorId: string;
  description?: string | null;
  metadata?: Record<string, any>;
}

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createPublication({
  title,
  authorId,
  description = null,
  metadata = {}
}: CreatePublicationOptions): Promise<Publication> {
  const id = randomUUID();
  let slug = generateSlug(title);
  
  return transaction(async (query) => {
    // Handle slug conflicts
    let slugSuffix = 0;
    let isUnique = false;
    
    while (!isUnique) {
      const currentSlug = slugSuffix === 0 ? slug : `${slug}-${slugSuffix}`;
      const existing = await query(
        `SELECT id FROM publications 
         WHERE slug = $1 AND deleted_at IS NULL`,
        [currentSlug]
      );
      
      if (existing.rows.length === 0) {
        slug = currentSlug;
        isUnique = true;
      } else {
        slugSuffix++;
      }
    }

    const result = await query(
      `INSERT INTO publications (id, title, slug, description, author_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, slug, description, author_id, metadata, created_at, updated_at`,
      [id, title, slug, description, authorId, JSON.stringify(metadata)]
    );

    return result.rows[0];
  });
}

export async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  const result = await query(
    `SELECT id, title, slug, description, author_id, metadata, created_at, updated_at
     FROM publications
     WHERE slug = $1 AND deleted_at IS NULL`,
    [slug]
  );
  return result.rows[0] || null;
}

export async function getPublicationById(id: string): Promise<Publication | null> {
  const result = await query(
    `SELECT id, title, slug, description, author_id, metadata, created_at, updated_at
     FROM publications
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getPublicationsByAuthor(
  authorId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ publications: Publication[]; total: number }> {
  const { limit = 10, offset = 0 } = options;

  const result = await query(
    `SELECT id, title, slug, description, author_id, metadata, created_at, updated_at
     FROM publications
     WHERE author_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [authorId, limit, offset]
  );

  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM publications
     WHERE author_id = $1 AND deleted_at IS NULL`,
    [authorId]
  );

  return {
    publications: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}

export async function updatePublication(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    metadata: Record<string, any>;
  }>
): Promise<Publication | null> {
  return transaction(async (query) => {
    const setFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      setFields.push(`title = $${paramCount}`);
      values.push(updates.title);
      paramCount++;

      // Update slug if title changes
      const newSlug = generateSlug(updates.title);
      setFields.push(`slug = $${paramCount}`);
      values.push(newSlug);
      paramCount++;
    }

    if (updates.description !== undefined) {
      setFields.push(`description = $${paramCount}`);
      values.push(updates.description);
      paramCount++;
    }

    if (updates.metadata !== undefined) {
      setFields.push(`metadata = $${paramCount}`);
      values.push(JSON.stringify(updates.metadata));
      paramCount++;
    }

    if (setFields.length === 0) return getPublicationById(id);

    values.push(id);
    const result = await query(
      `UPDATE publications
       SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING id, title, slug, description, author_id, metadata, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  });
}

export async function softDeletePublication(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE publications
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rowCount > 0;
}

export async function searchPublications(
  options: {
    query?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ publications: Publication[]; total: number }> {
  const { query = '', authorId, limit = 10, offset = 0 } = options;
  const values: any[] = [`%${query}%`];
  let paramCount = 1;

  let sql = `
    SELECT id, title, slug, description, author_id, metadata, created_at, updated_at
    FROM publications
    WHERE deleted_at IS NULL
    AND (title LIKE $1 OR description LIKE $1)
  `;

  if (authorId) {
    sql += ` AND author_id = $${paramCount + 1}`;
    values.push(authorId);
    paramCount++;
  }

  sql += `
    ORDER BY created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  values.push(limit, offset);

  const result = await query(sql, values);

  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM publications
     WHERE deleted_at IS NULL
     AND (title LIKE $1 OR description LIKE $1)
     ${authorId ? 'AND author_id = $2' : ''}`,
    authorId ? [`%${query}%`, authorId] : [`%${query}%`]
  );

  return {
    publications: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}