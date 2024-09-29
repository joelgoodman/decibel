-- migrations/001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  bio TEXT,
  avatar VARCHAR(255),
  role VARCHAR(50),
  status VARCHAR(50),
  signUpDate TIMESTAMP,
  subscriberLevel VARCHAR(50)
);