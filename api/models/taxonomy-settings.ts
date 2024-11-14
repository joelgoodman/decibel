import { query } from '../lib/db';
import { randomUUID } from 'crypto';

interface TaxonomySettings {
  id: string;
  publicationId: string;
  type: string;
  isRequired: boolean;
  maxItems?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaxonomySettingsOptions {
  publicationId: string;
  type: string;
  isRequired?: boolean;
  maxItems?: number;
}

export async function createTaxonomySettings({
  publicationId,
  type,
  isRequired = false,
  maxItems
}: CreateTaxonomySettingsOptions): Promise<TaxonomySettings> {
  const result = await query(
    `INSERT INTO taxonomy_settings (id, publication_id, type, is_required, max_items)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, publication_id, type, is_required, max_items, created_at, updated_at`,
    [randomUUID(), publicationId, type, isRequired, maxItems]
  );

  return result.rows[0];
}

export async function getTaxonomySettings(
  publicationId: string,
  type: string
): Promise<TaxonomySettings | null> {
  const result = await query(
    `SELECT id, publication_id, type, is_required, max_items, created_at, updated_at
     FROM taxonomy_settings
     WHERE publication_id = $1 AND type = $2`,
    [publicationId, type]
  );

  return result.rows[0] || null;
}

export async function updateTaxonomySettings(
  id: string,
  updates: Partial<{
    isRequired: boolean;
    maxItems: number | null;
  }>
): Promise<TaxonomySettings | null> {
  const setFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.isRequired !== undefined) {
    setFields.push(`is_required = $${paramCount}`);
    values.push(updates.isRequired);
    paramCount++;
  }

  if (updates.maxItems !== undefined) {
    setFields.push(`max_items = $${paramCount}`);
    values.push(updates.maxItems);
    paramCount++;
  }

  if (setFields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE taxonomy_settings
     SET ${setFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING id, publication_id, type, is_required, max_items, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}