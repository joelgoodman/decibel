-- migrations/004_create_pages_table.sql
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  publishDate TIMESTAMP,
  coverImage VARCHAR(255),
  authorId INTEGER,
  tags TEXT[],
  status VARCHAR(50),
  excerpt VARCHAR(255),
  categories TEXT[],
  views INTEGER,
  likes INTEGER,
  commentsEnabled BOOLEAN,
  slug VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);