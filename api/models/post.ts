import { query, transaction } from '../lib/db';
import { randomUUID } from 'crypto';
import { cacheService } from '../lib/cache';
import { sanitizeContent } from '../lib/validation/sanitize';
import type { Post, PostStatus, PostMeta } from '../types/posts';

interface CreatePostOptions {
  title: string;
  slug?: string;
  content: any[];
  excerpt?: string;
  authorId: string;
  status: PostStatus;
  meta: PostMeta;
  taxonomies?: string[];
  scheduledAt?: Date;
}

export async function createPost({
  title,
  slug,
  content,
  excerpt,
  authorId,
  status,
  meta,
  taxonomies = [],
  scheduledAt
}: CreatePostOptions): Promise<Post> {
  return transaction(async (query) => {
    const id = randomUUID();
    const finalSlug = slug || generateSlug(title);
    
    // Validate and sanitize content
    const sanitizedContent = sanitizeContent(content);

    // Create post
    const result = await query(
      `INSERT INTO posts (
        id, title, slug, content, excerpt, author_id, 
        status, meta, scheduled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id, title, finalSlug, JSON.stringify(sanitizedContent),
        excerpt, authorId, status, JSON.stringify(meta),
        scheduledAt
      ]
    );

    // Assign taxonomies
    if (taxonomies.length > 0) {
      const values = taxonomies.map((taxonomyId, index) => 
        `($1, $${index + 2}, ${index})`
      ).join(',');

      await query(
        `INSERT INTO post_taxonomies (post_id, taxonomy_id, order_position)
         VALUES ${values}`,
        [id, ...taxonomies]
      );
    }

    // Invalidate relevant caches
    await cacheService.invalidate('posts:list');
    await cacheService.invalidate(`posts:author:${authorId}`);

    return result.rows[0];
  });
}

export async function getPostById(id: string): Promise<Post | null> {
  const cacheKey = `posts:${id}`;
  const cached = await cacheService.get<Post>(cacheKey);
  if (cached) return cached;

  const result = await query(
    `SELECT p.*, 
            json_agg(DISTINCT t.*) as taxonomies,
            json_agg(DISTINCT c.*) as comments,
            count(DISTINCT l.user_id) as likes_count
     FROM posts p
     LEFT JOIN post_taxonomies pt ON p.id = pt.post_id
     LEFT JOIN taxonomies t ON pt.taxonomy_id = t.id
     LEFT JOIN comments c ON p.id = c.post_id
     LEFT JOIN likes l ON p.id = l.post_id
     WHERE p.id = $1 AND p.deleted_at IS NULL
     GROUP BY p.id`,
    [id]
  );

  const post = result.rows[0] || null;
  if (post) {
    await cacheService.set(cacheKey, post);
  }

  return post;
}

export async function searchPosts(options: {
  query?: string;
  authorId?: string;
  status?: PostStatus;
  taxonomies?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'date' | 'likes' | 'comments';
  orderDir?: 'asc' | 'desc';
}): Promise<{ posts: Post[]; total: number }> {
  const {
    query = '',
    authorId,
    status,
    taxonomies = [],
    limit = 10,
    offset = 0,
    orderBy = 'date',
    orderDir = 'desc'
  } = options;

  const values: any[] = [`%${query}%`];
  let paramCount = 1;

  let sql = `
    WITH post_stats AS (
      SELECT 
        p.id,
        COUNT(DISTINCT l.user_id) as likes_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM posts p
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
    )
    SELECT p.*, ps.likes_count, ps.comments_count
    FROM posts p
    JOIN post_stats ps ON p.id = ps.id
  `;

  if (taxonomies.length > 0) {
    sql += `
      JOIN post_taxonomies pt ON p.id = pt.post_id
      WHERE pt.taxonomy_id = ANY($${++paramCount})
    `;
    values.push(taxonomies);
  } else {
    sql += ' WHERE 1=1';
  }

  sql += ` AND (p.title ILIKE $1 OR p.excerpt ILIKE $1)`;

  if (authorId) {
    sql += ` AND p.author_id = $${++paramCount}`;
    values.push(authorId);
  }

  if (status) {
    sql += ` AND p.status = $${++paramCount}`;
    values.push(status);
  }

  // Add ordering
  const orderColumn = {
    date: 'p.created_at',
    likes: 'ps.likes_count',
    comments: 'ps.comments_count'
  }[orderBy];

  sql += ` ORDER BY ${orderColumn} ${orderDir === 'desc' ? 'DESC' : 'ASC'}`;
  sql += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
  values.push(limit, offset);

  const result = await query(sql, values);

  const countResult = await query(
    `SELECT COUNT(*) as total FROM posts p WHERE deleted_at IS NULL`,
    []
  );

  return {
    posts: result.rows,
    total: parseInt(countResult.rows[0].total)
  };
}

// Like/Unlike functionality
export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  return transaction(async (query) => {
    const existing = await query(
      `SELECT id FROM likes WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (existing.rows.length > 0) {
      await query(
        `DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      return false;
    } else {
      await query(
        `INSERT INTO likes (id, post_id, user_id)
         VALUES ($1, $2, $3)`,
        [randomUUID(), postId, userId]
      );
      return true;
    }
  });
}

// Comment functionality
export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment> {
  const sanitizedContent = sanitizeContent(content);

  const result = await query(
    `INSERT INTO comments (id, post_id, user_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [randomUUID(), postId, userId, sanitizedContent]
  );

  return result.rows[0];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}