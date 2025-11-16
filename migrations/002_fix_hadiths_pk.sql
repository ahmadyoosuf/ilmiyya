-- Migration: Fix Hadiths Primary Key
-- Description: Changes hadiths table to use composite primary key (book_id, id) to prevent ID collisions across books
-- This is critical since many books start their hadith IDs at 1, causing massive collisions

-- Drop existing primary key constraint
ALTER TABLE hadiths DROP CONSTRAINT hadiths_pkey;

-- Add composite primary key
ALTER TABLE hadiths ADD CONSTRAINT hadiths_pkey PRIMARY KEY (book_id, id);

-- Add index on the composite key for better performance
CREATE INDEX IF NOT EXISTS idx_hadiths_book_id_id ON hadiths(book_id, id);

-- Add comment explaining the composite key
COMMENT ON CONSTRAINT hadiths_pkey ON hadiths IS 'Composite primary key to prevent hadith ID collisions across different books';
