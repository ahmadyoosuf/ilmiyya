-- Migration: Enable Row Level Security for all tables
-- Description: Secures the database by enabling RLS and allowing read-only access for anonymous users
-- This prevents unauthorized INSERT, UPDATE, DELETE operations while keeping SELECT available

-- =====================================================
-- STEP 1: Enable RLS on all base tables
-- =====================================================

-- Enable RLS on books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on topics table
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on hadiths table
ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;

-- Enable RLS on hadith_topics table
ALTER TABLE hadith_topics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Create read-only SELECT policies for anonymous users
-- These policies allow anyone to read data but not modify it
-- =====================================================

-- Policy for books: Allow public read access
CREATE POLICY "Allow public read access on books"
ON books
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for categories: Allow public read access
CREATE POLICY "Allow public read access on categories"
ON categories
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for topics: Allow public read access
CREATE POLICY "Allow public read access on topics"
ON topics
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for hadiths: Allow public read access
CREATE POLICY "Allow public read access on hadiths"
ON hadiths
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy for hadith_topics: Allow public read access
CREATE POLICY "Allow public read access on hadith_topics"
ON hadith_topics
FOR SELECT
TO anon, authenticated
USING (true);

-- =====================================================
-- NOTES:
-- - Materialized views (book_toc_structures, hadith_by_topic_count, 
--   hadith_positions, topic_children_count, topic_tree_hierarchy) 
--   do not need RLS as they are views, not tables
-- - Admin operations should use service_role key (in Supabase dashboard or backend)
-- - No INSERT, UPDATE, DELETE policies = these operations are blocked for anon/authenticated
-- =====================================================

