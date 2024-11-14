import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import type { Taxonomy } from '../types/database';

interface CreateTaxonomyOptions {
  name: string;
  type: string;
  publicationId: string;
  parentId?: string | null;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  metadata?: Record<string, any>;
}

interface UpdateTaxonomyOptions extends Partial<CreateTaxonomyOptions> {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
  metadata?: Record<string, any>;
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createTaxonomy({
  name,
  type,
  publicationId,
  parentId = null,
  description = null,
  color = null,
  icon = null,
  metadata = {}
}: CreateTaxonomyOptions): Promise<Taxonomy> {
  return transaction(async (query) => {
    const id = randomUUID();
    let slug = generateSlug(name);
    
    // Handle slug conflicts within the same publication and type
    let slugSuffix = 0;
    let isUnique = false;
    
    while (!isUnique) {
      const currentSlug = slugSuffix === 0 ? slug : `${slug}-${slugSuffix}`;
      const existing = await query(
        `SELECT id FROM taxonomies 
         WHERE publication_id = $1 AND type = $2 AND slug = $3 AND deleted_at IS NULL`,
        [publicationId, type, currentSlug]
      );
      
      if (existing.rows.length === 0) {
        slug = currentSlug;
        isUnique = true;
      } else {
        slugSuffix++;
      }
    }

    const result = await query(
      `INSERT INTO taxonomies (
        id, name, slug, type, publication_id, parent_id, 
        description, color, icon, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id, name, slug, type, publicationId, parentId,
        description, color, icon, JSON.stringify(metadata)
      ]
    );

    return result.rows[0];
  });
}

export async function updateTaxonomy(
  id: string,
  updates: UpdateTaxonomyOptions
): Promise<Taxonomy | null> {
  return transaction(async (query) => {
    const current = await getTaxonomyById(id);
    if (!current) return null;

    const setFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      setFields.push(`name = $${paramCount}, slug = $${paramCount + 1}`);
      const slug = generateSlug(updates.name);
      values.push(updates.name, slug);
      paramCount += 2;
    }

    if (updates.description !== undefined) {
      setFields.push(`description = $${paramCount}`);
      values.push(updates.description);
      paramCount++;
    }

    if (updates.color !== undefined) {
      setFields.push(`color = $${paramCount}`);
      values.push(updates.color);
      paramCount++;
    }

    if (updates.icon !== undefined) {
      setFields.push(`icon = $${paramCount}`);
      values.push(updates.icon);
      paramCount++;
    }

    if (updates.parentId !== undefined) {
      setFields.push(`parent_id = $${paramCount}`);
      values.push(updates.parentId);
      paramCount++;
    }

    if (updates.metadata !== undefined) {
      setFields.push(`metadata = $${paramCount}`);
      values.push(JSON.stringify(updates.metadata));
      paramCount++;
    }

    if (setFields.length === 0) return current;

    values.push(id);
    const result = await query(
      `UPDATE taxonomies
       SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND deleted_at IS NULL
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  });
}

export async function deleteTaxonomy(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE taxonomies
     SET deleted_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rowCount > 0;
}

export async function getTaxonomyById(id: string): Promise<Taxonomy | null> {
  const result = await query(
    `SELECT *
     FROM taxonomies
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
}

export async function getTaxonomiesByContent(contentId: string): Promise<Taxonomy[]> {
  const result = await query(
    `SELECT t.*
     FROM taxonomies t
     JOIN content_taxonomies ct ON t.id = ct.taxonomy_id
     WHERE ct.content_id = $1 AND t.deleted_at IS NULL
     ORDER BY ct.order_position`,
    [contentId]
  );
  return result.rows;
}

export async function updateContentTaxonomies(
  contentId: string,
  taxonomyIds: string[]
): Promise<void> {
  return transaction(async (query) => {
    // Remove existing associations
    await query(
      `DELETE FROM content_taxonomies WHERE content_id = $1`,
      [contentId]
    );

    // Add new associations with order
    if (taxonomyIds.length > 0) {
      const values = taxonomyIds.map((id, index) => 
        `('${contentId}', '${id}', ${index})`
      ).join(',');

      await query(
        `INSERT INTO content_taxonomies (content_id, taxonomy_id, order_position)
         VALUES ${values}`
      );
    }
  });
}

export async function searchTaxonomies(
  options: {
    query?: string;
    type?: string;
    publicationId?: string;
    parentId?: string | null;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ taxonomies: Taxonomy[]; total: number }> {
  const { 
    query = '', 
    type,
    publicationId,
    parentId,
    limit = 10, 
    offset = 0 
  } = options;

  const values: any[] = [`%${query}%`];
  let paramCount = 1;

  let sql = `
    SELECT *
    FROM taxonomies
    WHERE deleted_at IS NULL
    AND (name ILIKE $1 OR description ILIKE $1)
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

  if (parentId !== undefined) {
    sql += ` AND parent_id ${parentId === null ? 'IS NULL' : `= $${paramCount + 1}`}`;
    if (parentId !== null) {
      values.push(parentId);
      paramCount++;
    }
  }

  sql += `
    ORDER BY name ASC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  values.push(limit, offset);

  const result = await query(sql, values);

  const countResult = await query(
    `SELECT COUNT(*) as total
     FROM taxonomies
     WHERE deleted_at IS NULL
     AND (name ILIKE $1 OR description ILIKE $1)
     ${publicationId ? 'AND publication_id = $2' : ''}
     ${type ? `AND type = $${paramCount - 1}` : ''}
     ${parentId !== undefined ? `AND parent_id ${parentId === null ? 'IS NULL' : `= $${paramCount}`}` : ''}`,
    values.slice(0, -2)
  );

  return {
    taxonomies: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}