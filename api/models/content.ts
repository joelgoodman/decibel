import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import type { Content, ContentVersion, ContentType, StatusType } from '../types/database';

interface CreateContentOptions {
  title: string;
  type: ContentType;
  publicationId: string;
  blocks?: any[];
  metadata?: Record<string, any>;
  createdBy: string;
}

interface UpdateContentOptions {
  title?: string;
  blocks?: any[];
  metadata?: Record<string, any>;
  status?: StatusType;
}

function generateSlug(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createContent({
  title,
  type,
  publicationId,
  blocks = [],
  metadata = {},
  createdBy
}: CreateContentOptions): Promise<Content> {
  return transaction(async (query) => {
    const id = randomUUID();
    let slug = generateSlug(title);
    
    // Handle slug conflicts within the same publication
    let slugSuffix = 0;
    let isUnique = false;
    
    while (!isUnique) {
      const currentSlug = slugSuffix === 0 ? slug : `${slug}-${slugSuffix}`;
      const existing = await query(
        `SELECT id FROM content 
         WHERE publication_id = $1 AND slug = $2 AND deleted_at IS NULL`,
        [publicationId, currentSlug]
      );
      
      if (existing.rows.length === 0) {
        slug = currentSlug;
        isUnique = true;
      } else {
        slugSuffix++;
      }
    }

    // Create initial content
    const result = await query(
      `INSERT INTO content (
        id, title, slug, type, blocks, metadata, 
        publication_id, version
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
      RETURNING 
        id, title, slug, type, status, blocks, metadata,
        publication_id, version, created_at, updated_at, published_at`,
      [
        id, title, slug, type, 
        JSON.stringify(blocks),
        JSON.stringify(metadata),
        publicationId
      ]
    );

    // Create initial version
    await query(
      `INSERT INTO content_versions (
        id, content_id, version, title, blocks, 
        metadata, created_by
      )
      VALUES ($1, $2, 1, $3, $4, $5, $6)`,
      [
        randomUUID(), id, title,
        JSON.stringify(blocks),
        JSON.stringify(metadata),
        createdBy
      ]
    );

    return result.rows[0];
  });
}

export async function getContentById(id: string): Promise<Content | null> {
  const result = await query(
    `SELECT 
      id, title, slug, type, status, blocks, metadata,
      publication_id, version, created_at, updated_at, published_at
     FROM content
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getContentBySlug(
  publicationId: string,
  slug: string
): Promise<Content | null> {
  const result = await query(
    `SELECT 
      id, title, slug, type, status, blocks, metadata,
      publication_id, version, created_at, updated_at, published_at
     FROM content
     WHERE publication_id = $1 AND slug = $2 AND deleted_at IS NULL`,
    [publicationId, slug]
  );
  return result.rows[0] || null;
}

export async function updateContent(
  id: string,
  updates: UpdateContentOptions,
  userId: string
): Promise<Content | null> {
  return transaction(async (query) => {
    const current = await getContentById(id);
    if (!current) return null;

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

    if (updates.blocks !== undefined) {
      setFields.push(`blocks = $${paramCount}`);
      values.push(JSON.stringify(updates.blocks));
      paramCount++;
    }

    if (updates.metadata !== undefined) {
      setFields.push(`metadata = $${paramCount}`);
      values.push(JSON.stringify(updates.metadata));
      paramCount++;
    }

    if (updates.status !== undefined) {
      setFields.push(`status = $${paramCount}`);
      values.push(updates.status);
      paramCount++;

      if (updates.status === 'PUBLISHED') {
        setFields.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }

    if (setFields.length === 0) return current;

    // Increment version
    setFields.push(`version = version + 1`);
    
    values.push(id);
    const result = await query(
      `UPDATE content
       SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING 
        id, title, slug, type, status, blocks, metadata,
        publication_id, version, created_at, updated_at, published_at`,
      values
    );

    if (!result.rows[0]) return null;

    // Create new version
    await query(
      `INSERT INTO content_versions (
        id, content_id, version, title, blocks, 
        metadata, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        randomUUID(),
        id,
        result.rows[0].version,
        result.rows[0].title,
        JSON.stringify(result.rows[0].blocks),
        JSON.stringify(result.rows[0].metadata),
        userId
      ]
    );

    return result.rows[0];
  });
}

export async function getContentVersion(
  contentId: string,
  version: number
): Promise<ContentVersion | null> {
  const result = await query(
    `SELECT 
      id, content_id, version, title, blocks, metadata,
      created_at, created_by
     FROM content_versions
     WHERE content_id = $1 AND version = $2`,
    [contentId, version]
  );
  return result.rows[0] || null;
}

export async function getContentVersions(
  contentId: string
): Promise<ContentVersion[]> {
  const result = await query(
    `SELECT 
      id, content_id, version, title, blocks, metadata,
      created_at, created_by
     FROM content_versions
     WHERE content_id = $1
     ORDER BY version DESC`,
    [contentId]
  );
  return result.rows;
}

export async function softDeleteContent(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE content
     SET deleted_at = CURRENT_TIMESTAMP, status = 'ARCHIVED'
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rowCount > 0;
}

export async function searchContent(
  options: {
    query?: string;
    publicationId?: string;
    type?: ContentType;
    status?: StatusType;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ content: Content[]; total: number }> {
  const { 
    query = '', 
    publicationId, 
    type,
    status,
    limit = 10, 
    offset = 0 
  } = options;

  const values: any[] = [`%${query}%`];
  let paramCount = 1;

  let sql = `
    SELECT 
      id, title, slug, type, status, blocks, metadata,
      publication_id, version, created_at, updated_at, published_at
    FROM content
    WHERE deleted_at IS NULL
    AND (title LIKE $1)
  `;

  if (publicationId) {
    sql += ` AND publication_id = $${paramCount + 1}`;
    values.push(publicationId);
    paramCount++;
  }

  if (type) {
    sql += ` AND type = $${paramCount + 1}`;
    values.push(type);
    paramCount++;
  }

  if (status) {
    sql += ` AND status = $${paramCount + 1}`;
    values.push(status);
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
     FROM content
     WHERE deleted_at IS NULL
     AND (title LIKE $1)
     ${publicationId ? 'AND publication_id = $2' : ''}
     ${type ? `AND type = $${paramCount - 1}` : ''}
     ${status ? `AND status = $${paramCount}` : ''}`,
    values.slice(0, -2)
  );

  return {
    content: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}