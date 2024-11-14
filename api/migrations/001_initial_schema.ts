import type { QueryFunction } from '../types/database';

export const name = '001_initial_schema';

export async function up(query: QueryFunction) {
  await query(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      permissions TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE publications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      author_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE content (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('NEWSLETTER','BLOG','PODCAST','PAGE')),
      status TEXT NOT NULL CHECK(status IN ('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED')) DEFAULT 'DRAFT',
      blocks TEXT NOT NULL DEFAULT '[]',
      version INTEGER NOT NULL DEFAULT 1,
      publication_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP,
      scheduled_at TIMESTAMP,
      newsletter_status TEXT CHECK(newsletter_status IN ('PENDING','SENDING','SENT','FAILED')),
      newsletter_sent_at TIMESTAMP,
      newsletter_error TEXT,
      deleted_at TIMESTAMP,
      FOREIGN KEY (publication_id) REFERENCES publications (id) ON DELETE CASCADE,
      UNIQUE(publication_id, slug, version)
    )
  `);

  await query(`
    CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_publications_author ON publications(author_id) WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_content_publication ON content(publication_id) WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_content_status ON content(status) WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_content_type ON content(type) WHERE deleted_at IS NULL
  `);

  await query(`
    CREATE INDEX idx_content_scheduled ON content(scheduled_at) 
    WHERE scheduled_at IS NOT NULL AND status = 'SCHEDULED'
  `);

  await query(`
    CREATE INDEX idx_content_newsletter ON content(newsletter_status) 
    WHERE newsletter_status IS NOT NULL
  `);

  // Insert default roles
  await query(`
    INSERT INTO roles (id, name, permissions) VALUES 
      ('role_owner', 'owner', '["*"]'),
      ('role_editor', 'editor', '["read:*","write:content","publish:content"]'),
      ('role_author', 'author', '["read:content","write:content"]'),
      ('role_subscriber', 'subscriber', '["read:content"]')
  `);
}

export async function down(query: QueryFunction) {
  await query('DROP INDEX IF EXISTS idx_content_newsletter');
  await query('DROP INDEX IF EXISTS idx_content_scheduled');
  await query('DROP INDEX IF EXISTS idx_content_type');
  await query('DROP INDEX IF EXISTS idx_content_status');
  await query('DROP INDEX IF EXISTS idx_content_publication');
  await query('DROP INDEX IF EXISTS idx_publications_author');
  await query('DROP INDEX IF EXISTS idx_users_email');
  
  await query('DROP TABLE IF EXISTS content');
  await query('DROP TABLE IF EXISTS publications');
  await query('DROP TABLE IF EXISTS user_roles');
  await query('DROP TABLE IF EXISTS roles');
  await query('DROP TABLE IF EXISTS users');
}