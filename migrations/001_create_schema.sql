-- Migration: Create Ilmiyyah Hadith Database Schema
-- Description: Creates tables for categories, books, topics, and hadiths with full referential integrity

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Categories (Book category directories)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Books (Individual hadith book metadata)
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Topics (Hierarchical topic structure)
CREATE TABLE topics (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    level INTEGER NOT NULL,
    parent_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Hadiths (Core hadith content)
CREATE TABLE hadiths (
    id BIGINT PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
    nass TEXT NOT NULL,
    part TEXT,
    page TEXT,
    aya INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance

-- Foreign key indexes
CREATE INDEX idx_books_category_id ON books(category_id);
CREATE INDEX idx_topics_parent_id ON topics(parent_id);
CREATE INDEX idx_hadiths_book_id ON hadiths(book_id);
CREATE INDEX idx_hadiths_topic_id ON hadiths(topic_id);

-- Composite index for pagination
CREATE INDEX idx_hadiths_book_page ON hadiths(book_id, page);

-- Page index for filtering
CREATE INDEX idx_hadiths_page ON hadiths(page);

-- Full-text search indexes using GIN with Arabic text search configuration
-- Create Arabic text search configuration if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'arabic') THEN
        CREATE TEXT SEARCH CONFIGURATION arabic ( COPY = simple );
    END IF;
END
$$;

-- GIN indexes for full-text search on Arabic text
CREATE INDEX idx_hadiths_nass_fts ON hadiths USING gin(to_tsvector('arabic', nass));
CREATE INDEX idx_topics_title_fts ON topics USING gin(to_tsvector('arabic', title));
CREATE INDEX idx_books_title_fts ON books USING gin(to_tsvector('arabic', title));
CREATE INDEX idx_categories_name_fts ON categories USING gin(to_tsvector('arabic', name_ar));

-- Comments for documentation
COMMENT ON TABLE categories IS 'Book category directories from أقسام الكتب';
COMMENT ON TABLE books IS 'Individual hadith book metadata';
COMMENT ON TABLE topics IS 'Hierarchical topic structure from gtopics.json';
COMMENT ON TABLE hadiths IS 'Core hadith content from book JSON files';

COMMENT ON COLUMN hadiths.page IS 'Page number as TEXT to allow duplicates and special notations';
COMMENT ON COLUMN topics.parent_id IS 'Self-referencing foreign key for topic hierarchy';
COMMENT ON COLUMN hadiths.nass IS 'Main hadith text content in Arabic';

