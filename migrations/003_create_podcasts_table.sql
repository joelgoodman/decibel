-- migrations/003_create_podcasts_table.sql
CREATE TABLE IF NOT EXISTS podcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  coverImage VARCHAR(255),
  hostId INTEGER,
  categories TEXT[],
  rssFeed VARCHAR(255),
  episodesCount INTEGER,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);