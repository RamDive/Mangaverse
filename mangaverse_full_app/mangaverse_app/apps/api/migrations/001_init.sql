-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  password_hash text,
  username text UNIQUE,
  bio text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- mangas
CREATE TABLE IF NOT EXISTS mangas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text,
  alt_titles text[],
  description text,
  cover_url text,
  author text,
  status text,
  tags text[],
  language text DEFAULT 'ja',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- chapters
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manga_id uuid REFERENCES mangas(id) ON DELETE CASCADE,
  number numeric,
  title text,
  slug text,
  pages jsonb,
  release_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  manga_id uuid REFERENCES mangas(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, manga_id)
);

-- reading_progress
CREATE TABLE IF NOT EXISTS reading_progress (
  user_id uuid REFERENCES users(id),
  chapter_id uuid REFERENCES chapters(id),
  page_index integer,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, chapter_id)
);

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  manga_id uuid REFERENCES mangas(id),
  rating smallint CHECK (rating >= 1 and rating <= 5),
  content text,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type text,
  payload jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mangas_search ON mangas USING gin(to_tsvector('english', title || ' ' || coalesce(array_to_string(tags, ' '), '')));
CREATE INDEX IF NOT EXISTS idx_chapters_manga ON chapters(manga_id);
