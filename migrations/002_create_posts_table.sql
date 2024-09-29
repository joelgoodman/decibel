-- migrations/002_create_posts_table.sql
CREATE TABLE IF NOT EXISTS posts (
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
  isNewsletter BOOLEAN,
  subscriberLevel VARCHAR(50),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);