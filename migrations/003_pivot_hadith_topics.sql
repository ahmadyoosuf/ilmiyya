-- Migration: Replace hadiths.topic_id with hadith_topics pivot table
-- Rationale: JSON 'tid' is NOT topic id; topics are linked via topicid/*.txt files.
-- We model a many-to-many between hadiths and topics.

-- Drop FK and column from hadiths if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'hadiths' AND column_name = 'topic_id'
    ) THEN
        -- Drop FK constraint if exists
        FOR r IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'hadiths'::regclass
              AND contype = 'f'
        LOOP
            EXECUTE format('ALTER TABLE hadiths DROP CONSTRAINT %I', r.conname);
        END LOOP;
        ALTER TABLE hadiths DROP COLUMN topic_id;
    END IF;
END $$;

-- Create pivot table
CREATE TABLE IF NOT EXISTS hadith_topics (
    book_id UUID NOT NULL,
    hadith_id BIGINT NOT NULL,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (book_id, hadith_id, topic_id),
    FOREIGN KEY (book_id, hadith_id) REFERENCES hadiths(book_id, id) ON DELETE CASCADE
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_hadith_topics_topic_id ON hadith_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_hadith_topics_book_hadith ON hadith_topics(book_id, hadith_id);


